import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.api.v1.api import api_router
from app.services.seed_service import seed_database_if_empty
from app.services.qdrant_service import QdrantService

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    # Perform lightweight automatic migrations for user_id column
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_rec_user ON recommendations (user_id);"))
            conn.commit()
    except Exception as e:
        logger.warning(f"Database column verification notice: {e}")

    db = SessionLocal()
    try:
        datasets_dir = Path(__file__).resolve().parent.parent.parent / "datasets"
        if not datasets_dir.exists():
            datasets_dir = Path(__file__).resolve().parent.parent / "datasets"
        
        logger.info(f"Checking data seeds in: {datasets_dir}")
        seed_res = seed_database_if_empty(db=db, datasets_dir=datasets_dir)
        logger.info(f"Database readiness verified: {seed_res}")
    except Exception as e:
        logger.error(f"Error during database startup seed: {e}")
    finally:
        db.close()

    # Seed initial scientific reference corpus into Qdrant
    try:
        logger.info("Initializing Qdrant vector database knowledge corpus...")
        QdrantService.seed_initial_knowledge()
    except Exception as e:
        logger.warning(f"Qdrant startup seeding warning: {e}")

    yield

    logger.info("Shutting down application...")


app = FastAPI(
    title="Food Packaging Material Recommendation API",
    description=(
        "AI-Based Intelligent Food Packaging Material Recommendation System for Food Commodities. "
        "Provides deterministic multi-criteria material screening, equilibrium produce respiration matching, "
        "experimental shelf-life estimation, Qdrant semantic RAG retrieval, user accounts, and Groq-powered technical analysis."
    ),
    version="1.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS setup
origins = settings.get_cors_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "PackSci AI Backend",
        "version": app.version,
        "environment": settings.ENVIRONMENT
    }


@app.get("/")
def root():
    return {
        "project": "Food Packaging Recommendation API",
        "docs": "/docs",
        "health": "/health",
        "api_v1_health": f"{settings.API_V1_STR}/health",
        "qdrant": f"{settings.API_V1_STR}/qdrant/status"
    }

