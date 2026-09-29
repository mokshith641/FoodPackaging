import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger(__name__)

db_url = settings.get_database_url()

# Configure engine arguments depending on DB type
connect_args = {}
if "sqlite" in db_url:
    connect_args["check_same_thread"] = False

try:
    if "sqlite" in db_url:
        engine = create_engine(db_url, connect_args=connect_args)
    else:
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_recycle=300,
            pool_size=5,
            max_overflow=10,
            connect_args={"connect_timeout": 5}
        )
        # Test connection immediately
        with engine.connect() as conn:
            logger.info("Successfully connected to PostgreSQL database.")
except Exception as e:
    logger.warning(f"Could not connect to configured PostgreSQL database ({e}). Falling back to local SQLite database.")
    fallback_url = "sqlite:///./food_packaging.db"
    engine = create_engine(fallback_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
