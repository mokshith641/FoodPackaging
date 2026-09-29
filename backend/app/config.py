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
    # Supports direct DATABASE_URL or Supabase/Postgres variables or fallback to SQLite
    DATABASE_URL: Optional[str] = None
    POSTGRES_URL_NON_POOLING: Optional[str] = None
    POSTGRES_PRISMA_URL: Optional[str] = None
    POSTGRES_URL: Optional[str] = None

    # Groq API configuration
    GROQ_API_KEY: Optional[str] = None
    GROQ_API: Optional[str] = None
    GROQ_MODEL_NAME: str = "llama-3.3-70b-versatile"

    # CORS configuration
    FRONTEND_ORIGIN: str = "http://localhost:5173"

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
            # Clean postgres:// to postgresql:// for SQLAlchemy 2.0
            if url.startswith("postgres://"):
                url = "postgresql://" + url[len("postgres://"):]
            return url
        # Fallback to local SQLite if no remote database string is configured
        db_path = root_dir / "food_packaging.db"
        return f"sqlite:///{db_path}"

    def get_groq_api_key(self) -> Optional[str]:
        return (
            self.GROQ_API_KEY
            or self.GROQ_API
            or os.getenv("GROQ_API_KEY")
            or os.getenv("GROQ_API")
        )

    class Config:
        case_sensitive = True
        extra = "allow"


settings = Settings()
