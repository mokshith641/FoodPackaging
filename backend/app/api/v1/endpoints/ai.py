from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Recommendation
from app.schemas.recommendation import AIExplainRequest, AIExplainResponse
from app.schemas.ai import ChatQueryRequest, ChatQueryResponse
from app.services.groq_service import GroqExplanationService
from app.services.rag_service import RAGAssistantService

router = APIRouter()


@router.post("/chat", response_model=ChatQueryResponse)
def chat_ai_assistant(
    request: ChatQueryRequest,
    db: Session = Depends(get_db)
):
    """
    RAG-powered packaging assistant endpoint combining Qdrant semantic retrieval,
    PostgreSQL entity verification, and Groq LLM grounded synthesis.
    """
    response_data = RAGAssistantService.answer_question(
        question=request.question,
        db=db,
        focus_commodity_id=request.focus_commodity_id
    )
    return ChatQueryResponse(**response_data)


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
