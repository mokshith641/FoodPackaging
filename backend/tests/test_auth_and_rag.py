import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models.models import User, Recommendation

client = TestClient(app)


def setup_module():
    Base.metadata.create_all(bind=engine)


def test_health_and_qdrant_status():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["online", "healthy"]

    qdrant_res = client.get("/api/v1/qdrant/status")
    assert qdrant_res.status_code == 200
    q_data = qdrant_res.json()
    assert q_data["status"] in ["online", "healthy"]
    assert q_data["collection_name"] == "food_packaging_corpus"


def test_auth_registration_and_login():
    test_email = "scientist_test@packsci.ai"
    test_password = "SecurePassword123!"

    # Clean previous if exists
    db = SessionLocal()
    existing = db.query(User).filter(User.email == test_email).first()
    if existing:
        db.delete(existing)
        db.commit()
    db.close()

    # 1. Register new user
    reg_payload = {
        "name": "Dr. Scientist Test",
        "email": test_email,
        "password": test_password,
        "confirm_password": test_password
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == test_email
    token = reg_data["access_token"]

    # 2. Reject duplicate email registration
    dup_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # 3. Login with valid credentials
    login_res = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": test_password
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # 4. Reject invalid credentials
    bad_login_res = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": "WrongPassword!"
    })
    assert bad_login_res.status_code == 401

    # 5. Access /auth/me
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["name"] == "Dr. Scientist Test"


def test_user_isolated_recommendations():
    # User 1
    u1_res = client.post("/api/v1/auth/register", json={
        "name": "User One",
        "email": "user_one@packsci.ai",
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    if u1_res.status_code == 400:
        u1_res = client.post("/api/v1/auth/login", json={
            "email": "user_one@packsci.ai",
            "password": "Password123!"
        })
    token1 = u1_res.json()["access_token"]

    # User 2
    u2_res = client.post("/api/v1/auth/register", json={
        "name": "User Two",
        "email": "user_two@packsci.ai",
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    if u2_res.status_code == 400:
        u2_res = client.post("/api/v1/auth/login", json={
            "email": "user_two@packsci.ai",
            "password": "Password123!"
        })
    token2 = u2_res.json()["access_token"]

    # User 1 creates recommendation
    rec_payload = {
        "commodity_name": "Test Roasted Peanuts",
        "commodity_category": "nuts_high_fat",
        "moisture_content_pct": 2.0,
        "fat_content_pct": 50.0,
        "ph": 6.5,
        "target_shelf_life_days": 180,
        "storage_type": "ambient",
        "storage_temp_c": 25.0,
        "relative_humidity_pct": 60.0,
        "transport_condition": "normal",
        "cost_tier": "balanced",
        "sustainability_priority": "medium",
        "product_state": "dried"
    }

    create_res = client.post(
        "/api/v1/recommendations",
        json=rec_payload,
        headers={"Authorization": f"Bearer {token1}"}
    )
    assert create_res.status_code == 201
    rec_id = create_res.json()["id"]

    # User 1 can view
    view_res1 = client.get(f"/api/v1/recommendations/{rec_id}", headers={"Authorization": f"Bearer {token1}"})
    assert view_res1.status_code == 200

    # User 2 cannot delete User 1's recommendation (Forbidden)
    del_res2 = client.delete(f"/api/v1/recommendations/{rec_id}", headers={"Authorization": f"Bearer {token2}"})
    assert del_res2.status_code == 403

    # User 1 can delete
    del_res1 = client.delete(f"/api/v1/recommendations/{rec_id}", headers={"Authorization": f"Bearer {token1}"})
    assert del_res1.status_code == 200


def test_rag_ai_chat_endpoint():
    chat_payload = {
        "question": "What packaging avoids anaerobic fermentation in fresh strawberries?"
    }
    res = client.post("/api/v1/ai/chat", json=chat_payload)
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert len(data["answer"]) > 20
    assert "sources" in data
    assert "provider" in data


def test_qdrant_document_ingestion():
    ingest_payload = {
        "title": "Bio-Based Starch Polymers in MAP Fresh Packaging (ASTM D6868)",
        "content": (
            "Thermoplastic starch (TPS) compounded with biodegradable polyesters (PBAT) delivers "
            "controlled moisture barrier (WVTR 25 g/m2.day) and elevated oxygen permeability (OTR 1200 cc/m2.day.atm), "
            "matching the aerobic respiration kinetics of active postharvest berries while achieving 100% industrial compostability."
        ),
        "source_url": "https://www.astm.org/standards/d6868",
        "doc_type": "industry_standard",
        "page_number": 2
    }

    ingest_res = client.post("/api/v1/qdrant/ingest", json=ingest_payload)
    assert ingest_res.status_code == 200
    assert ingest_res.json()["status"] == "success"

    # Search for ingested content
    search_res = client.get("/api/v1/qdrant/search?query=thermoplastic+starch+PBAT&top_k=2")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["results_count"] > 0
