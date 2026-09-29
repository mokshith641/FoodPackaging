from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class DataSourceResponse(BaseModel):
    id: int
    source_name: str
    source_type: str
    organization: str
    url: Optional[str] = None
    license: Optional[str] = None
    description: Optional[str] = None
    verification_date: Optional[str] = None
    data_quality_notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MissingFieldStat(BaseModel):
    field_name: str
    missing_count: int
    total_count: int
    percentage_missing: float


class DataQualityReport(BaseModel):
    total_commodities: int
    total_materials: int
    total_sources: int
    verified_materials_count: int
    unverified_materials_count: int
    commodity_missing_fields: List[MissingFieldStat]
    material_missing_fields: List[MissingFieldStat]
    provenance_summary: List[Dict[str, Any]]
    data_integrity_score: float
    notes: str
