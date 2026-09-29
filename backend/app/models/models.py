import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.database import Base


class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(150), nullable=False, unique=True)
    source_type = Column(String(100), nullable=False)  # e.g., 'academic', 'government', 'industry_spec'
    organization = Column(String(200), nullable=False)
    url = Column(String(500), nullable=True)
    license = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    verification_date = Column(String(50), nullable=True)
    data_quality_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    commodities = relationship("FoodCommodity", back_populates="provenance_source")


class FoodCommodity(Base):
    __tablename__ = "food_commodities"

    id = Column(Integer, primary_key=True, index=True)
    commodity_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    moisture_pct = Column(Float, nullable=True)
    fat_pct = Column(Float, nullable=True)
    ph = Column(Float, nullable=True)
    water_activity = Column(Float, nullable=True)
    is_respiring = Column(Boolean, default=False)
    resp_rate_mg_co2_kg_h = Column(Float, nullable=True)  # at optimal temp
    resp_q10 = Column(Float, nullable=True)
    resp_class = Column(String(50), nullable=True)
    ethylene_sensitive = Column(Boolean, default=False)
    optimal_temp_c = Column(Float, nullable=True)
    optimal_rh_pct = Column(Float, nullable=True)
    optimal_o2_min = Column(Float, nullable=True)
    optimal_o2_max = Column(Float, nullable=True)
    optimal_co2_min = Column(Float, nullable=True)
    optimal_co2_max = Column(Float, nullable=True)
    base_shelf_life_days = Column(Float, nullable=True)
    shelf_life_q10 = Column(Float, nullable=True)
    o2_sensitivity = Column(Integer, default=0)  # 0 to 3 scale
    moisture_sensitivity = Column(Integer, default=0)  # 0 to 3 scale
    light_sensitive = Column(Boolean, default=False)
    moisture_limit_pct = Column(Float, nullable=True)
    default_storage_type = Column(String(50), default="ambient")  # ambient, chilled, frozen, cool
    data_confidence = Column(String(50), default="medium")  # high, medium, experimental, unverified
    provenance_notes = Column(Text, nullable=True)
    provenance_source_id = Column(Integer, ForeignKey("data_sources.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    provenance_source = relationship("DataSource", back_populates="commodities")


class PackagingMaterial(Base):
    __tablename__ = "packaging_materials"

    id = Column(Integer, primary_key=True, index=True)
    material_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False, index=True)
    structure = Column(String(200), nullable=False)
    polymer_family = Column(String(100), nullable=False, index=True)
    ref_thickness_um = Column(Float, nullable=False)
    thickness_min_um = Column(Float, nullable=True)
    thickness_max_um = Column(Float, nullable=True)
    thickness_scalable = Column(Boolean, default=True)
    
    # Barrier properties at reference thickness
    # OTR in cc / (m² · day · atm) at 23°C, 0% RH
    otr_ref = Column(Float, nullable=False)
    # WVTR in g / (m² · day) at 38°C, 90% RH
    wvtr_ref = Column(Float, nullable=False)
    
    o2_permeability = Column(Float, nullable=True)  # cc · µm / (m² · day · atm)
    wv_permeability = Column(Float, nullable=True)  # g · µm / (m² · day)
    co2_to_o2_ratio = Column(Float, default=4.0)
    
    tunable_otr_min = Column(Float, nullable=True)
    tunable_otr_max = Column(Float, nullable=True)
    
    density_g_cc = Column(Float, nullable=True)
    tensile_strength_mpa = Column(Float, nullable=True)
    heat_seal_temp_c = Column(Float, nullable=True)
    sealability = Column(String(50), default="good")  # good, fair, poor_alone, none
    standalone_pack_ok = Column(Boolean, default=True)
    transparency = Column(String(50), default="high")  # high, medium, opaque
    light_barrier = Column(Boolean, default=False)
    low_temp_ok = Column(Boolean, default=True)
    gas_barrier_class = Column(String(50), default="low")  # low, medium, high, breathable
    is_breathable = Column(Boolean, default=False)
    recyclability = Column(String(50), default="recyclable")  # recyclable, non_recyclable, limited, compostable
    is_biodegradable = Column(Boolean, default=False)
    cost_inr_per_kg = Column(Float, nullable=True)
    co2e_kg_per_kg = Column(Float, nullable=True)
    sustainability_score = Column(Float, nullable=True)  # 0-100 scale
    food_contact_approved = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    verification_status = Column(String(50), default="verified_datasheet")
    source_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    specifications = relationship("MaterialSpecification", back_populates="material", cascade="all, delete-orphan")


class MaterialSpecification(Base):
    __tablename__ = "material_specifications"

    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("packaging_materials.id", ondelete="CASCADE"), nullable=False)
    property_name = Column(String(100), nullable=False)
    property_value = Column(Float, nullable=True)
    property_value_text = Column(String(200), nullable=True)
    unit = Column(String(50), nullable=False)
    test_standard = Column(String(100), nullable=True)  # e.g., ASTM D3985, ASTM F1249
    test_temp_c = Column(Float, nullable=True)
    test_rh_pct = Column(Float, nullable=True)
    is_measured = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)

    material = relationship("PackagingMaterial", back_populates="specifications")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    commodity_id = Column(Integer, ForeignKey("food_commodities.id"), nullable=True)
    commodity_name = Column(String(200), nullable=False)
    commodity_category = Column(String(100), nullable=False)
    moisture_content_pct = Column(Float, nullable=True)
    fat_content_pct = Column(Float, nullable=True)
    ph = Column(Float, nullable=True)
    respiration_rate = Column(Float, nullable=True)
    respiration_rate_unit = Column(String(50), default="mg_CO2_kg_h")
    target_shelf_life_days = Column(Float, nullable=False)
    storage_type = Column(String(50), nullable=False)  # ambient, chilled, frozen, cool
    storage_temp_c = Column(Float, nullable=False)
    relative_humidity_pct = Column(Float, nullable=False)
    transport_condition = Column(String(100), default="normal")
    cost_tier = Column(String(50), default="balanced")  # budget, balanced, premium
    sustainability_priority = Column(String(50), default="medium")  # low, medium, high
    product_state = Column(String(50), default="fresh")  # fresh, dried, liquid, frozen, processed
    package_format = Column(String(100), nullable=True)  # pouch, tray, vacuum_skin, bag, carton
    user_notes = Column(Text, nullable=True)
    
    # Scoring & explanation persistence
    ai_explanation = Column(Text, nullable=True)
    ai_model_used = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    materials = relationship("RecommendationMaterial", back_populates="recommendation", cascade="all, delete-orphan")


class RecommendationMaterial(Base):
    __tablename__ = "recommendation_materials"

    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id", ondelete="CASCADE"), nullable=False)
    material_id = Column(Integer, ForeignKey("packaging_materials.id"), nullable=False)
    material_name = Column(String(200), nullable=False)
    material_code = Column(String(50), nullable=False)
    rank = Column(Integer, nullable=False)
    total_score = Column(Float, nullable=False)
    
    # Subscores (0 - 100)
    moisture_score = Column(Float, nullable=False)
    oxygen_score = Column(Float, nullable=False)
    temp_score = Column(Float, nullable=False)
    mechanical_score = Column(Float, nullable=False)
    cost_score = Column(Float, nullable=False)
    sustainability_score = Column(Float, nullable=False)
    
    compatibility_verdict = Column(String(100), nullable=False)
    warnings = Column(Text, nullable=True)  # JSON or comma-separated
    trade_offs = Column(Text, nullable=True)
    experimental_shelf_life_min = Column(Float, nullable=True)
    experimental_shelf_life_max = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    recommendation = relationship("Recommendation", back_populates="materials")
    material = relationship("PackagingMaterial")


Index("idx_rec_created", Recommendation.created_at)
Index("idx_mat_barrier", PackagingMaterial.gas_barrier_class, PackagingMaterial.recyclability)
