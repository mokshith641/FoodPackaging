import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Search for .env in current directory, parent directory, and backend directory
root_dir = Path(__file__).resolve().parent.parent.parent
env_paths = [
    root_dir / ".env",
    Path(__file__).resolve().parent.parent / ".env",
    Path(".env")
]

for p in env_paths:
    if p.exists():
        load_dotenv(p, override=False)


class Settings(BaseSettings):
    PROJECT_NAME: str = "Food Packaging Material Recommendation System"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # Database configuration
    DATABASE_URL: Optional[str] = None
    POSTGRES_URL_NON_POOLING: Optional[str] = None
    POSTGRES_PRISMA_URL: Optional[str] = None
    POSTGRES_URL: Optional[str] = None

    # Groq API configuration
    GROQ_API_KEY: Optional[str] = None
    GROQ_API: Optional[str] = None
    GROQ_MODEL_NAME: str = "qwen/qwen3.8-27b"

    # Authentication / JWT configuration
    JWT_SECRET_KEY: Optional[str] = None
    SUPABASE_JWT_SECRET: Optional[str] = None
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Qdrant Vector Database configuration
    QDRANT_URL: Optional[str] = None
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_COLLECTION_NAME: str = "food_packaging_corpus"
    EMBEDDING_MODEL_NAME: str = "BAAI/bge-small-en-v1.5"
    EMBEDDING_DIM: int = 384

    # CORS configuration
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    FRONTEND_URL: Optional[str] = None
    CORS_ORIGINS: Optional[str] = None

    def get_cors_origins(self) -> list[str]:
        origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
        if self.FRONTEND_ORIGIN:
            origins.append(self.FRONTEND_ORIGIN.strip().rstrip("/"))
        if self.FRONTEND_URL:
            origins.append(self.FRONTEND_URL.strip().rstrip("/"))
        
        env_frontend = os.getenv("FRONTEND_URL")
        if env_frontend:
            origins.append(env_frontend.strip().rstrip("/"))

        env_cors = self.CORS_ORIGINS or os.getenv("CORS_ORIGINS")
        if env_cors:
            if env_cors.startswith("[") and env_cors.endswith("]"):
                import json
                try:
                    parsed = json.loads(env_cors)
                    if isinstance(parsed, list):
                        origins.extend([str(o).strip().rstrip("/") for o in parsed])
                except Exception:
                    pass
            else:
                for part in env_cors.split(","):
                    p = part.strip().rstrip("/")
                    if p:
                        origins.append(p)

        # Deduplicate
        seen = set()
        deduped = []
        for o in origins:
            if o and o not in seen:
                seen.add(o)
                deduped.append(o)
        return deduped

    def get_database_url(self) -> str:
        url = (
            self.DATABASE_URL
            or self.POSTGRES_URL_NON_POOLING
            or self.POSTGRES_PRISMA_URL
            or self.POSTGRES_URL
            or os.getenv("DATABASE_URL")
            or os.getenv("POSTGRES_URL_NON_POOLING")
            or os.getenv("POSTGRES_PRISMA_URL")
            or os.getenv("POSTGRES_URL")
        )
        if url:
            if url.startswith("postgres://"):
                url = "postgresql://" + url[len("postgres://"):]
            return url
        db_path = root_dir / "food_packaging.db"
        return f"sqlite:///{db_path}"

    def get_groq_api_key(self) -> Optional[str]:
        return (
            self.GROQ_API_KEY
            or self.GROQ_API
            or os.getenv("GROQ_API_KEY")
            or os.getenv("GROQ_API")
        )

    def get_jwt_secret(self) -> str:
        return (
            self.JWT_SECRET_KEY
            or self.SUPABASE_JWT_SECRET
            or os.getenv("JWT_SECRET_KEY")
            or os.getenv("SUPABASE_JWT_SECRET")
            or "packsci-ai-secure-jwt-secret-key-food-packaging-2026"
        )

    def get_qdrant_url(self) -> Optional[str]:
        return (
            self.QDRANT_URL
            or os.getenv("QDRANT_URL")
            or os.getenv("QDRANT_HOST")
        )

    def get_qdrant_api_key(self) -> Optional[str]:
        return (
            self.QDRANT_API_KEY
            or os.getenv("QDRANT_API_KEY")
        )

    class Config:
        case_sensitive = True
        extra = "allow"


settings = Settings()
