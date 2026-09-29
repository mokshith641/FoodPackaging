from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Recommendation
from app.schemas.recommendation import AIExplainRequest, AIExplainResponse
from app.services.groq_service import GroqExplanationService

router = APIRouter()


@router.post("/explain", response_model=AIExplainResponse)
def explain_recommendation(
    request: AIExplainRequest,
    db: Session = Depends(get_db)
):
    explanation_res = GroqExplanationService.generate_explanation(request)

    # If associated with a saved recommendation, persist the AI explanation
    if request.recommendation_id:
        rec = db.query(Recommendation).filter(Recommendation.id == request.recommendation_id).first()
        if rec:
            rec.ai_explanation = explanation_res.explanation
            rec.ai_model_used = f"{explanation_res.provider} ({explanation_res.model_name})"
            db.commit()

    return explanation_res
