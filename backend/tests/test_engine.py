import pytest
from app.schemas.recommendation import RecommendationRequest
from app.models.models import FoodCommodity, PackagingMaterial
from app.engine.recommender import PackagingRecommendationEngine
from app.engine.produce_model import calculate_temperature_adjusted_respiration


def test_temperature_adjusted_respiration():
    # Base rate = 10 mg CO2 at 5°C. At 15°C with Q10=2.5, rate should be 25 mg CO2
    rate = calculate_temperature_adjusted_respiration(
        base_rate_mg_co2=10.0,
        base_temp_c=5.0,
        target_temp_c=15.0,
        q10=2.5
    )
    assert round(rate, 1) == 25.0


def test_recommendation_deterministic_ranking(db_session):
    materials = db_session.query(PackagingMaterial).all()
    assert len(materials) >= 8

    # Case 1: Potato chips (high fat, low moisture, ambient storage)
    # Expected: Metallised films (Met-BOPP/CPP or Met-PET) should score high; plain LDPE should score low/moderate.
    chips_req = RecommendationRequest(
        commodity_name="Potato chips",
        commodity_category="snack_fried",
        moisture_content_pct=2.0,
        fat_content_pct=33.0,
        ph=6.0,
        target_shelf_life_days=90.0,
        storage_type="ambient",
        storage_temp_c=25.0,
        relative_humidity_pct=60.0,
        transport_condition="normal",
        cost_tier="balanced",
        sustainability_priority="medium",
        product_state="dried",
        package_format="pouch"
    )

    commodity = db_session.query(FoodCommodity).filter(FoodCommodity.name.ilike("%Potato chips%")).first()
    result = PackagingRecommendationEngine.evaluate_recommendation(
        request=chips_req,
        commodity=commodity,
        all_materials=materials
    )

    assert len(result.ranked_candidates) > 0
    top_cand = result.ranked_candidates[0]
    # Metallised film or high barrier film should be top rank
    assert top_cand.score_breakdown.oxygen_score >= 70.0
    assert top_cand.score_breakdown.moisture_score >= 70.0


def test_subzero_temperature_filter(db_session):
    materials = db_session.query(PackagingMaterial).all()

    # Case: Frozen fish at -18°C
    frozen_req = RecommendationRequest(
        commodity_name="Frozen fish",
        commodity_category="frozen",
        moisture_content_pct=78.0,
        fat_content_pct=3.0,
        target_shelf_life_days=270.0,
        storage_type="frozen",
        storage_temp_c=-18.0,
        relative_humidity_pct=90.0,
        transport_condition="refrigerated",
        cost_tier="balanced",
        sustainability_priority="medium",
        product_state="frozen",
        package_format="pouch"
    )

    commodity = db_session.query(FoodCommodity).filter(FoodCommodity.name.ilike("%Frozen fish%")).first()
    result = PackagingRecommendationEngine.evaluate_recommendation(
        request=frozen_req,
        commodity=commodity,
        all_materials=materials
    )

    # CPP film is not low_temp_ok and should be rejected or excluded
    rejected_codes = [r.material_code for r in result.rejected_candidates]
    assert "M04" in rejected_codes or any("M04" in r.material_code for r in result.rejected_candidates)


def test_respiring_produce_anaerobic_hazard_filter(db_session):
    materials = db_session.query(PackagingMaterial).all()

    # Case: Fresh broccoli (very high respiration)
    veg_req = RecommendationRequest(
        commodity_name="Broccoli",
        commodity_category="fresh_produce_veg",
        moisture_content_pct=89.0,
        fat_content_pct=0.4,
        respiration_rate=35.0,
        target_shelf_life_days=14.0,
        storage_type="chilled",
        storage_temp_c=4.0,
        relative_humidity_pct=95.0,
        transport_condition="refrigerated",
        cost_tier="balanced",
        sustainability_priority="medium",
        product_state="fresh",
        package_format="pouch"
    )

    commodity = db_session.query(FoodCommodity).filter(FoodCommodity.name.ilike("%Broccoli%")).first()
    result = PackagingRecommendationEngine.evaluate_recommendation(
        request=veg_req,
        commodity=commodity,
        all_materials=materials
    )

    # Ultra-high barrier films (like PET/Al foil/PE or EVOH) should be rejected due to anaerobic risk
    rejected_names = [r.material_name for r in result.rejected_candidates]
    assert any("Aluminium" in n or "Foil" in n or "EVOH" in n for n in rejected_names)
