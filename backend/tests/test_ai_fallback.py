import pytest
from app.schemas.recommendation import AIExplainRequest, RecommendationRequest, CandidateMaterialResult, ScoreBreakdown
from app.services.groq_service import GroqExplanationService


def test_groq_deterministic_fallback():
    req = AIExplainRequest(
        commodity_name="Potato chips",
        commodity_category="snack_fried",
        inputs=RecommendationRequest(
            commodity_name="Potato chips",
            commodity_category="snack_fried",
            moisture_content_pct=2.0,
            fat_content_pct=33.0,
            ph=6.0,
            target_shelf_life_days=90.0,
            storage_type="ambient",
            storage_temp_c=25.0,
            relative_humidity_pct=60.0
        ),
        top_candidates=[
            CandidateMaterialResult(
                material_id=1,
                material_code="M10",
                material_name="Metallised BOPP / CPP laminate",
                structure="Met-BOPP 20 / CPP 25",
                polymer_family="metallised",
                rank=1,
                total_score=89.5,
                score_breakdown=ScoreBreakdown(
                    moisture_score=95.0,
                    oxygen_score=92.0,
                    temp_score=90.0,
                    mechanical_score=85.0,
                    cost_score=88.0,
                    sustainability_score=60.0,
                    weights_applied={}
                ),
                compatibility_verdict="Highly Recommended",
                reasons_for_ranking=["Superior moisture barrier", "High oxygen barrier against rancidity"],
                warnings=["Non-recyclable multi-material structure"],
                trade_offs=["High barrier with limited circularity"],
                technical_specifications={"wvtr_g_m2_day": 1.0, "otr_cc_m2_day_atm": 50.0},
                verification_status="verified_datasheet"
            )
        ]
    )

    # Test fallback builder directly
    fallback_res = GroqExplanationService._build_deterministic_fallback(
        request=req,
        reason="Testing offline mode"
    )

    assert fallback_res.is_fallback is True
    assert "Executive Summary" in fallback_res.explanation
    assert "Metallised BOPP / CPP laminate" in fallback_res.explanation
    assert "Quality Control" in fallback_res.explanation
