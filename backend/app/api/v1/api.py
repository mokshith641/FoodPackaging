from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    commodities,
    materials,
    recommendations,
    ai,
    sources,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(commodities.router, prefix="/commodities", tags=["Commodities"])
api_router.include_router(materials.router, prefix="/materials", tags=["Packaging Materials"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Explanation"])
api_router.include_router(sources.router, prefix="/sources", tags=["Data Sources & Quality"])
