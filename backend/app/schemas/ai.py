from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ChatQueryRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=1000)
    focus_commodity_id: Optional[int] = None


class SourceCitation(BaseModel):
    source_id: int
    title: str
    url: Optional[str] = None
    type: str
    relevance_score: float
    snippet: str


class ChatQueryResponse(BaseModel):
    question: str
    answer: str
    provider: str
    model_name: str
    sources: List[SourceCitation]
    database_matches: int = 0
    created_at: str


class DocumentIngestRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=300)
    content: str = Field(..., min_length=20)
    source_url: Optional[str] = None
    doc_type: str = "technical_reference"
    page_number: Optional[int] = None


class DocumentIngestResponse(BaseModel):
    status: str
    document_title: str
    chunks_ingested: int
    message: Optional[str] = None
