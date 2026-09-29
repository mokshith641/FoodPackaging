from typing import Optional
from pydantic import BaseModel, ConfigDict


class CommodityBase(BaseModel):
    commodity_code: str
    name: str
    category: str
    moisture_pct: Optional[float] = None
    fat_pct: Optional[float] = None
    ph: Optional[float] = None
    water_activity: Optional[float] = None
    is_respiring: bool = False
    resp_rate_mg_co2_kg_h: Optional[float] = None
    resp_q10: Optional[float] = None
    resp_class: Optional[str] = None
    ethylene_sensitive: bool = False
    optimal_temp_c: Optional[float] = None
    optimal_rh_pct: Optional[float] = None
    optimal_o2_min: Optional[float] = None
    optimal_o2_max: Optional[float] = None
    optimal_co2_min: Optional[float] = None
    optimal_co2_max: Optional[float] = None
    base_shelf_life_days: Optional[float] = None
    shelf_life_q10: Optional[float] = None
    o2_sensitivity: int = 0
    moisture_sensitivity: int = 0
    light_sensitive: bool = False
    moisture_limit_pct: Optional[float] = None
    default_storage_type: str = "ambient"
    data_confidence: str = "medium"
    provenance_notes: Optional[str] = None


class CommodityCreate(CommodityBase):
    pass


class CommodityResponse(CommodityBase):
    id: int
    provenance_source_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
