import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator, ConfigDict


class RecommendationRequest(BaseModel):
    commodity_id: Optional[int] = None
    commodity_name: str = Field(..., min_length=1, description="Name of food commodity")
    commodity_category: str = Field(..., min_length=1, description="Category of food commodity")
    
    moisture_content_pct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Moisture percentage (0-100)")
    fat_content_pct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Fat percentage (0-100)")
    ph: Optional[float] = Field(None, ge=1.0, le=14.0, description="pH level (1-14)")
    
    respiration_rate: Optional[float] = Field(None, ge=0.0, description="Respiration rate in mg CO2/kg-h or cc/kg-h")
    respiration_rate_unit: str = Field("mg_CO2_kg_h", description="Unit of respiration rate")
    
    target_shelf_life_days: float = Field(..., gt=0.0, le=3650.0, description="Target shelf life in days (>0)")
    
    storage_type: str = Field("ambient", description="ambient, chilled, frozen, cool")
    storage_temp_c: float = Field(..., ge=-40.0, le=60.0, description="Storage temperature in Celsius")
    relative_humidity_pct: float = Field(..., ge=0.0, le=100.0, description="Relative humidity percentage (0-100)")
    
    transport_condition: str = Field("normal", description="normal, long_distance, refrigerated, high_humidity")
    cost_tier: str = Field("balanced", description="budget, balanced, premium")
    sustainability_priority: str = Field("medium", description="low, medium, high")
    product_state: str = Field("fresh", description="fresh, dried, liquid, frozen, processed")
    package_format: Optional[str] = Field("pouch", description="pouch, tray, vacuum_skin, bag, carton, bottle")
    user_notes: Optional[str] = None

    @field_validator("storage_type")
    @classmethod
    def validate_storage_type(cls, v: str) -> str:
        valid = ["ambient", "chilled", "frozen", "cool"]
        if v.lower() not in valid:
            raise ValueError(f"Storage type must be one of {valid}")
        return v.lower()

    @field_validator("cost_tier")
    @classmethod
    def validate_cost_tier(cls, v: str) -> str:
        valid = ["budget", "balanced", "premium"]
        if v.lower() not in valid:
            raise ValueError(f"Cost tier must be one of {valid}")
        return v.lower()

    @field_validator("sustainability_priority")
    @classmethod
    def validate_sustainability_priority(cls, v: str) -> str:
        valid = ["low", "medium", "high"]
        if v.lower() not in valid:
            raise ValueError(f"Sustainability priority must be one of {valid}")
        return v.lower()


class ScoreBreakdown(BaseModel):
    moisture_score: float
    oxygen_score: float
    temp_score: float
    mechanical_score: float
    cost_score: float
    sustainability_score: float
    weights_applied: Dict[str, float]


class CandidateMaterialResult(BaseModel):
    material_id: int
    material_code: str
    material_name: str
    structure: str
    polymer_family: str
    rank: int
    total_score: float
    score_breakdown: ScoreBreakdown
    compatibility_verdict: str
    reasons_for_ranking: List[str]
    warnings: List[str]
    trade_offs: List[str]
    technical_specifications: Dict[str, Any]
    source_url: Optional[str] = None
    verification_status: str
    experimental_shelf_life_min_days: Optional[float] = None
    experimental_shelf_life_max_days: Optional[float] = None
    shelf_life_estimation_notes: Optional[str] = None


class RejectedCandidate(BaseModel):
    material_id: int
    material_code: str
    material_name: str
    rejection_reason: str
    violated_constraints: List[str]


class RecommendationResponse(BaseModel):
    id: Optional[int] = None
    commodity_name: str
    commodity_category: str
    timestamp: datetime.datetime
    inputs: RecommendationRequest
    ranked_candidates: List[CandidateMaterialResult]
    rejected_candidates: List[RejectedCandidate]
    missing_critical_inputs: List[str]
    uncertainties: List[str]
    engineering_disclaimer: str
    ai_explanation: Optional[str] = None
    ai_model_used: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SavedRecommendationSummary(BaseModel):
    id: int
    commodity_name: str
    commodity_category: str
    target_shelf_life_days: float
    storage_type: str
    storage_temp_c: float
    top_material_name: Optional[str] = None
    top_score: Optional[float] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class AIExplainRequest(BaseModel):
    recommendation_id: Optional[int] = None
    commodity_name: str
    commodity_category: str
    inputs: RecommendationRequest
    top_candidates: List[CandidateMaterialResult]


class AIExplainResponse(BaseModel):
    explanation: str
    provider: str
    model_name: str
    generated_at: datetime.datetime
    is_fallback: bool = False
    status_message: Optional[str] = None
