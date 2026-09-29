import pytest


def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["database"]["status"] == "healthy"
    assert data["database"]["commodities_count"] > 0
    assert data["database"]["materials_count"] > 0


def test_get_commodities(client):
    response = client.get("/api/v1/commodities")
    assert response.status_code == 200
    commodities = response.json()
    assert len(commodities) >= 15

    # Filter by category
    resp_filtered = client.get("/api/v1/commodities?category=snack_fried")
    assert resp_filtered.status_code == 200
    snacks = resp_filtered.json()
    assert len(snacks) > 0
    assert all(s["category"] == "snack_fried" for s in snacks)


def test_get_materials(client):
    response = client.get("/api/v1/materials")
    assert response.status_code == 200
    materials = response.json()
    assert len(materials) >= 8

    mat_id = materials[0]["id"]
    res_single = client.get(f"/api/v1/materials/{mat_id}")
    assert res_single.status_code == 200
    assert res_single.json()["id"] == mat_id
    assert len(res_single.json()["specifications"]) > 0


def test_create_and_manage_recommendation(client):
    payload = {
        "commodity_name": "Wheat flour (atta)",
        "commodity_category": "dry_staple",
        "moisture_content_pct": 12.0,
        "fat_content_pct": 1.7,
        "ph": 6.3,
        "target_shelf_life_days": 180.0,
        "storage_type": "ambient",
        "storage_temp_c": 25.0,
        "relative_humidity_pct": 60.0,
        "transport_condition": "normal",
        "cost_tier": "balanced",
        "sustainability_priority": "medium",
        "product_state": "dried",
        "package_format": "pouch"
    }

    # Create recommendation
    res = client.post("/api/v1/recommendations", json=payload)
    assert res.status_code == 201
    rec_data = res.json()
    assert rec_data["id"] is not None
    assert len(rec_data["ranked_candidates"]) > 0

    rec_id = rec_data["id"]

    # List recommendations
    list_res = client.get("/api/v1/recommendations")
    assert list_res.status_code == 200
    summaries = list_res.json()
    assert any(s["id"] == rec_id for s in summaries)

    # Get single recommendation
    get_res = client.get(f"/api/v1/recommendations/{rec_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == rec_id

    # Delete recommendation
    del_res = client.delete(f"/api/v1/recommendations/{rec_id}")
    assert del_res.status_code == 200

    # Ensure 404 on deleted
    not_found_res = client.get(f"/api/v1/recommendations/{rec_id}")
    assert not_found_res.status_code == 404


def test_data_sources_and_quality_report(client):
    res_sources = client.get("/api/v1/sources")
    assert res_sources.status_code == 200
    sources = res_sources.json()
    assert len(sources) >= 3

    res_report = client.get("/api/v1/sources/report")
    assert res_report.status_code == 200
    report = res_report.json()
    assert report["total_commodities"] > 0
    assert report["total_materials"] > 0
    assert report["data_integrity_score"] > 0
