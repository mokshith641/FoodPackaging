from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.schemas.ai import DocumentIngestRequest, DocumentIngestResponse
from app.services.qdrant_service import QdrantService
from app.services.auth_service import get_optional_current_user, User
from app.config import settings

router = APIRouter()


@router.get("/status")
def get_qdrant_status():
    client = QdrantService.get_client()
    if not client:
        return {
            "status": "unavailable",
            "message": "Qdrant client could not be initialized"
        }

    try:
        QdrantService.ensure_collection()
        collection_info = client.get_collection(settings.QDRANT_COLLECTION_NAME)
        return {
            "status": "online",
            "collection_name": settings.QDRANT_COLLECTION_NAME,
            "embedding_model": settings.EMBEDDING_MODEL_NAME,
            "embedding_dim": settings.EMBEDDING_DIM,
            "points_count": getattr(collection_info, "points_count", 0),
            "cloud_url_configured": bool(settings.get_qdrant_url())
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@router.post("/ingest", response_model=DocumentIngestResponse)
def ingest_reference_document(
    doc: DocumentIngestRequest,
    current_user: User = Depends(get_optional_current_user)
):
    """
    Ingest food packaging scientific reference documents, barrier studies, or standards into Qdrant.
    """
    result = QdrantService.ingest_document(
        title=doc.title,
        content=doc.content,
        source_url=doc.source_url,
        doc_type=doc.doc_type,
        page_number=doc.page_number
    )

    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message", "Ingestion failed")
        )

    return DocumentIngestResponse(
        status="success",
        document_title=doc.title,
        chunks_ingested=result.get("chunks_ingested", 1),
        message="Document successfully embedded and indexed into Qdrant vector corpus."
    )


@router.get("/search")
def search_vector_corpus(
    query: str = Query(..., min_length=2),
    top_k: int = Query(4, ge=1, le=10)
):
    results = QdrantService.search(query=query, top_k=top_k)
    return {
        "query": query,
        "results_count": len(results),
        "results": results
    }
