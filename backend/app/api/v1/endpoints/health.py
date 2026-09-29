from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models.models import FoodCommodity, PackagingMaterial
from app.config import settings

router = APIRouter()


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    commodities_count = db.query(FoodCommodity).count() if db_status == "healthy" else 0
    materials_count = db.query(PackagingMaterial).count() if db_status == "healthy" else 0

    groq_configured = bool(settings.get_groq_api_key())

    return {
        "status": "online",
        "service": "AI-Based Intelligent Food Packaging Material Recommendation System",
        "version": "1.0.0",
        "database": {
            "status": db_status,
            "commodities_count": commodities_count,
            "materials_count": materials_count
        },
        "ai_service": {
            "groq_configured": groq_configured,
            "groq_model": settings.GROQ_MODEL_NAME,
            "fallback_available": True
        }
    }
