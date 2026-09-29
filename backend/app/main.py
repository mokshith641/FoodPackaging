import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.api.v1.api import api_router
from app.services.seed_service import seed_database_if_empty

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed dataset
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

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

    yield

    logger.info("Shutting down application...")


app = FastAPI(
    title="Food Packaging Material Recommendation API",
    description=(
        "AI-Based Intelligent Food Packaging Material Recommendation System for Food Commodities. "
        "Provides deterministic multi-criteria material screening, equilibrium produce respiration matching, "
        "experimental shelf-life estimation, and Groq-powered technical analysis."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS setup
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "project": "Food Packaging Recommendation API",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
