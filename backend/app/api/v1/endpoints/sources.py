from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import DataSource, FoodCommodity, PackagingMaterial
from app.schemas.source import DataSourceResponse, DataQualityReport, MissingFieldStat

router = APIRouter()


@router.get("", response_model=List[DataSourceResponse])
def get_data_sources(db: Session = Depends(get_db)):
    return db.query(DataSource).order_by(DataSource.source_name.asc()).all()


@router.get("/report", response_model=DataQualityReport)
def get_data_quality_report(db: Session = Depends(get_db)):
    commodities = db.query(FoodCommodity).all()
    materials = db.query(PackagingMaterial).all()
    sources = db.query(DataSource).all()

    total_c = len(commodities)
    total_m = len(materials)

    # Commodity missing fields
    comm_stats = []
    if total_c > 0:
        c_fields = {
            "moisture_pct": sum(1 for c in commodities if c.moisture_pct is None),
            "fat_pct": sum(1 for c in commodities if c.fat_pct is None),
            "ph": sum(1 for c in commodities if c.ph is None),
            "water_activity": sum(1 for c in commodities if c.water_activity is None),
            "resp_rate_mg_co2_kg_h (respiring only)": sum(1 for c in commodities if c.is_respiring and c.resp_rate_mg_co2_kg_h is None),
            "optimal_temp_c": sum(1 for c in commodities if c.optimal_temp_c is None),
            "optimal_rh_pct": sum(1 for c in commodities if c.optimal_rh_pct is None),
        }
        for k, v in c_fields.items():
            comm_stats.append(MissingFieldStat(
                field_name=k,
                missing_count=v,
                total_count=total_c,
                percentage_missing=round((v / total_c) * 100.0, 1)
            ))

    # Material missing fields
    mat_stats = []
    if total_m > 0:
        m_fields = {
            "tensile_strength_mpa": sum(1 for m in materials if m.tensile_strength_mpa is None),
            "density_g_cc": sum(1 for m in materials if m.density_g_cc is None),
            "heat_seal_temp_c": sum(1 for m in materials if m.heat_seal_temp_c is None),
            "cost_inr_per_kg": sum(1 for m in materials if m.cost_inr_per_kg is None),
            "co2e_kg_per_kg": sum(1 for m in materials if m.co2e_kg_per_kg is None)
        }
        for k, v in m_fields.items():
            mat_stats.append(MissingFieldStat(
                field_name=k,
                missing_count=v,
                total_count=total_m,
                percentage_missing=round((v / total_m) * 100.0, 1)
            ))

    verified_count = sum(1 for m in materials if m.verification_status == "verified_datasheet")
    unverified_count = total_m - verified_count

    # Calculate overall integrity score (0-100)
    avg_comm_missing = sum(s.percentage_missing for s in comm_stats) / len(comm_stats) if comm_stats else 0
    avg_mat_missing = sum(s.percentage_missing for s in mat_stats) / len(mat_stats) if mat_stats else 0
    integrity_score = max(0.0, min(100.0, round(100.0 - (avg_comm_missing * 0.4 + avg_mat_missing * 0.3 + (unverified_count / max(total_m, 1)) * 30), 1)))

    prov_summary = [
        {"source_name": s.source_name, "organization": s.organization, "type": s.source_type, "url": s.url}
        for s in sources
    ]

    return DataQualityReport(
        total_commodities=total_c,
        total_materials=total_m,
        total_sources=len(sources),
        verified_materials_count=verified_count,
        unverified_materials_count=unverified_count,
        commodity_missing_fields=comm_stats,
        material_missing_fields=mat_stats,
        provenance_summary=prov_summary,
        data_integrity_score=integrity_score,
        notes="Automated provenance and data completeness audit. Unknown physical fields are preserved as explicit NULLs without imputation."
    )
