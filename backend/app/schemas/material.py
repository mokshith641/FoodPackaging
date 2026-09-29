from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class MaterialSpecificationResponse(BaseModel):
    id: int
    property_name: str
    property_value: Optional[float] = None
    property_value_text: Optional[str] = None
    unit: str
    test_standard: Optional[str] = None
    test_temp_c: Optional[float] = None
    test_rh_pct: Optional[float] = None
    is_measured: bool = True
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MaterialBase(BaseModel):
    material_code: str
    name: str
    structure: str
    polymer_family: str
    ref_thickness_um: float
    thickness_min_um: Optional[float] = None
    thickness_max_um: Optional[float] = None
    thickness_scalable: bool = True
    otr_ref: float
    wvtr_ref: float
    o2_permeability: Optional[float] = None
    wv_permeability: Optional[float] = None
    co2_to_o2_ratio: float = 4.0
    tunable_otr_min: Optional[float] = None
    tunable_otr_max: Optional[float] = None
    density_g_cc: Optional[float] = None
    tensile_strength_mpa: Optional[float] = None
    heat_seal_temp_c: Optional[float] = None
    sealability: str = "good"
    standalone_pack_ok: bool = True
    transparency: str = "high"
    light_barrier: bool = False
    low_temp_ok: bool = True
    gas_barrier_class: str = "low"
    is_breathable: bool = False
    recyclability: str = "recyclable"
    is_biodegradable: bool = False
    cost_inr_per_kg: Optional[float] = None
    co2e_kg_per_kg: Optional[float] = None
    sustainability_score: Optional[float] = None
    food_contact_approved: bool = True
    notes: Optional[str] = None
    verification_status: str = "verified_datasheet"
    source_url: Optional[str] = None


class MaterialResponse(MaterialBase):
    id: int
    specifications: List[MaterialSpecificationResponse] = []

    model_config = ConfigDict(from_attributes=True)
