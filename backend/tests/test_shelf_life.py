import pytest
from app.engine.shelf_life import estimate_experimental_shelf_life


def test_shelf_life_with_valid_baseline():
    res = estimate_experimental_shelf_life(
        base_shelf_life_days=180.0,
        optimal_temp_c=25.0,
        storage_temp_c=25.0,
        shelf_life_q10=2.0,
        is_respiring=False,
        moisture_sensitivity=2,
        o2_sensitivity=2,
        material_wvtr=1.0,
        material_otr=5.0,
        target_shelf_life_days=180.0
    )

    assert res["sufficient_evidence"] is True
    assert res["min_days"] is not None
    assert res["max_days"] is not None
    assert res["min_days"] <= res["max_days"]
    assert "EXPERIMENTAL ESTIMATE" in res["disclaimer"]


def test_shelf_life_missing_baseline():
    res = estimate_experimental_shelf_life(
        base_shelf_life_days=None,
        optimal_temp_c=None,
        storage_temp_c=25.0,
        shelf_life_q10=None,
        is_respiring=False,
        moisture_sensitivity=1,
        o2_sensitivity=1,
        material_wvtr=10.0,
        material_otr=100.0,
        target_shelf_life_days=30.0
    )

    assert res["sufficient_evidence"] is False
    assert res["min_days"] is None
    assert "Insufficient baseline shelf-life data" in res["calculation_basis"]
    assert len(res["variables_required"]) > 0
