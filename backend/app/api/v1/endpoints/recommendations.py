import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import (
    User,
    FoodCommodity,
    PackagingMaterial,
    Recommendation,
    RecommendationMaterial,
)
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    SavedRecommendationSummary,
    CandidateMaterialResult,
    ScoreBreakdown,
    RejectedCandidate,
)
from app.engine.recommender import PackagingRecommendationEngine
from app.services.auth_service import get_optional_current_user, get_current_user

router = APIRouter()


@router.post("", response_model=RecommendationResponse, status_code=status.HTTP_201_CREATED)
def create_recommendation(
    request: RecommendationRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    # Lookup commodity if provided or by name
    commodity = None
    if request.commodity_id:
        commodity = db.query(FoodCommodity).filter(FoodCommodity.id == request.commodity_id).first()
    if not commodity and request.commodity_name:
        commodity = db.query(FoodCommodity).filter(FoodCommodity.name.ilike(request.commodity_name.strip())).first()

    materials = db.query(PackagingMaterial).all()
    if not materials:
        raise HTTPException(
            status_code=500,
            detail="Packaging materials database is empty. Please ensure data seed has run."
        )

    # Execute deterministic recommendation engine
    result = PackagingRecommendationEngine.evaluate_recommendation(
        request=request,
        commodity=commodity,
        all_materials=materials
    )

    # Persist recommendation to database (associated with user if signed in)
    db_rec = Recommendation(
        user_id=current_user.id if current_user else None,
        commodity_id=commodity.id if commodity else None,
        commodity_name=request.commodity_name,
        commodity_category=request.commodity_category,
        moisture_content_pct=request.moisture_content_pct,
        fat_content_pct=request.fat_content_pct,
        ph=request.ph,
        respiration_rate=request.respiration_rate,
        respiration_rate_unit=request.respiration_rate_unit,
        target_shelf_life_days=request.target_shelf_life_days,
        storage_type=request.storage_type,
        storage_temp_c=request.storage_temp_c,
        relative_humidity_pct=request.relative_humidity_pct,
        transport_condition=request.transport_condition,
        cost_tier=request.cost_tier,
        sustainability_priority=request.sustainability_priority,
        product_state=request.product_state,
        package_format=request.package_format,
        user_notes=request.user_notes
    )
    db.add(db_rec)
    db.flush()

    for cand in result.ranked_candidates:
        db_mat = RecommendationMaterial(
            recommendation_id=db_rec.id,
            material_id=cand.material_id,
            material_name=cand.material_name,
            material_code=cand.material_code,
            rank=cand.rank,
            total_score=cand.total_score,
            moisture_score=cand.score_breakdown.moisture_score,
            oxygen_score=cand.score_breakdown.oxygen_score,
            temp_score=cand.score_breakdown.temp_score,
            mechanical_score=cand.score_breakdown.mechanical_score,
            cost_score=cand.score_breakdown.cost_score,
            sustainability_score=cand.score_breakdown.sustainability_score,
            compatibility_verdict=cand.compatibility_verdict,
            warnings=json.dumps(cand.warnings),
            trade_offs=json.dumps(cand.trade_offs),
            experimental_shelf_life_min=cand.experimental_shelf_life_min_days,
            experimental_shelf_life_max=cand.experimental_shelf_life_max_days
        )
        db.add(db_mat)

    db.commit()
    db.refresh(db_rec)

    result.id = db_rec.id
    return result


@router.get("", response_model=List[SavedRecommendationSummary])
def list_saved_recommendations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    query = db.query(Recommendation)
    if current_user:
        # User-specific isolation: show recommendations owned by the current user (or public legacy with user_id=None)
        query = query.filter((Recommendation.user_id == current_user.id) | (Recommendation.user_id.is_(None)))
    else:
        # For guest visitors: show public legacy demo evaluations
        query = query.filter(Recommendation.user_id.is_(None))

    recs = query.order_by(Recommendation.created_at.desc()).offset(skip).limit(limit).all()
    summaries = []
    for r in recs:
        top_mat = db.query(RecommendationMaterial).filter(
            RecommendationMaterial.recommendation_id == r.id
        ).order_by(RecommendationMaterial.rank.asc()).first()
        
        summaries.append(SavedRecommendationSummary(
            id=r.id,
            commodity_name=r.commodity_name,
            commodity_category=r.commodity_category,
            target_shelf_life_days=r.target_shelf_life_days,
            storage_type=r.storage_type,
            storage_temp_c=r.storage_temp_c,
            top_material_name=top_mat.material_name if top_mat else None,
            top_score=top_mat.total_score if top_mat else None,
            created_at=r.created_at
        ))
    return summaries


@router.get("/{rec_id}", response_model=RecommendationResponse)
def get_recommendation_by_id(
    rec_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    rec = db.query(Recommendation).filter(Recommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail=f"Recommendation #{rec_id} not found")

    # Enforce ownership check: if record is owned by a user, only that user (or admin) can view it
    if rec.user_id is not None:
        if not current_user or (current_user.id != rec.user_id and not current_user.is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this recommendation."
            )

    rec_materials = db.query(RecommendationMaterial).filter(
        RecommendationMaterial.recommendation_id == rec.id
    ).order_by(RecommendationMaterial.rank.asc()).all()

    req = RecommendationRequest(
        commodity_id=rec.commodity_id,
        commodity_name=rec.commodity_name,
        commodity_category=rec.commodity_category,
        moisture_content_pct=rec.moisture_content_pct,
        fat_content_pct=rec.fat_content_pct,
        ph=rec.ph,
        respiration_rate=rec.respiration_rate,
        respiration_rate_unit=rec.respiration_rate_unit or "mg_CO2_kg_h",
        target_shelf_life_days=rec.target_shelf_life_days,
        storage_type=rec.storage_type,
        storage_temp_c=rec.storage_temp_c,
        relative_humidity_pct=rec.relative_humidity_pct,
        transport_condition=rec.transport_condition,
        cost_tier=rec.cost_tier,
        sustainability_priority=rec.sustainability_priority,
        product_state=rec.product_state,
        package_format=rec.package_format,
        user_notes=rec.user_notes
    )

    ranked_candidates = []
    for rm in rec_materials:
        mat_entity = db.query(PackagingMaterial).filter(PackagingMaterial.id == rm.material_id).first()
        warnings_list = json.loads(rm.warnings) if rm.warnings else []
        trade_offs_list = json.loads(rm.trade_offs) if rm.trade_offs else []
        
        specs = {
            "ref_thickness_um": mat_entity.ref_thickness_um if mat_entity else 25.0,
            "otr_cc_m2_day_atm": mat_entity.otr_ref if mat_entity else 0.0,
            "wvtr_g_m2_day": mat_entity.wvtr_ref if mat_entity else 0.0,
            "sealability": mat_entity.sealability if mat_entity else "good",
            "recyclability": mat_entity.recyclability if mat_entity else "recyclable",
            "cost_inr_per_kg": mat_entity.cost_inr_per_kg if mat_entity else None,
            "co2e_kg_per_kg": mat_entity.co2e_kg_per_kg if mat_entity else None
        }

        ranked_candidates.append(CandidateMaterialResult(
            material_id=rm.material_id,
            material_code=rm.material_code,
            material_name=rm.material_name,
            structure=mat_entity.structure if mat_entity else "",
            polymer_family=mat_entity.polymer_family if mat_entity else "",
            rank=rm.rank,
            total_score=rm.total_score,
            score_breakdown=ScoreBreakdown(
                moisture_score=rm.moisture_score,
                oxygen_score=rm.oxygen_score,
                temp_score=rm.temp_score,
                mechanical_score=rm.mechanical_score,
                cost_score=rm.cost_score,
                sustainability_score=rm.sustainability_score,
                weights_applied={}
            ),
            compatibility_verdict=rm.compatibility_verdict,
            reasons_for_ranking=[f"Rank #{rm.rank} candidate from saved analysis."],
            warnings=warnings_list,
            trade_offs=trade_offs_list,
            technical_specifications=specs,
            source_url=mat_entity.source_url if mat_entity else None,
            verification_status=mat_entity.verification_status if mat_entity else "verified",
            experimental_shelf_life_min_days=rm.experimental_shelf_life_min,
            experimental_shelf_life_max_days=rm.experimental_shelf_life_max
        ))

    return RecommendationResponse(
        id=rec.id,
        commodity_name=rec.commodity_name,
        commodity_category=rec.commodity_category,
        timestamp=rec.created_at,
        inputs=req,
        ranked_candidates=ranked_candidates,
        rejected_candidates=[],
        missing_critical_inputs=[],
        uncertainties=[],
        engineering_disclaimer="Saved recommendation retrieved from historical database.",
        ai_explanation=rec.ai_explanation,
        ai_model_used=rec.ai_model_used
    )


@router.delete("/{rec_id}", status_code=status.HTTP_200_OK)
def delete_recommendation(
    rec_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rec = db.query(Recommendation).filter(Recommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail=f"Recommendation #{rec_id} not found")

    # Enforce strict ownership: user can only delete their own recommendation
    if rec.user_id is not None and rec.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this recommendation."
        )

    db.delete(rec)
    db.commit()
    return {"status": "success", "message": f"Recommendation #{rec_id} deleted successfully"}
