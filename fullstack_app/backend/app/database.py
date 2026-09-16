import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

logger = logging.getLogger(__name__)

# Try MySQL if configured, else fallback to SQLite
engine = None
try:
    if settings.DATABASE_URL.startswith("mysql"):
        logger.info(f"Attempting connection to MySQL: {settings.DATABASE_URL}")
        test_engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
        with test_engine.connect() as conn:
            logger.info("Successfully connected to MySQL database.")
        engine = test_engine
except Exception as e:
    logger.warning(f"MySQL connection failed ({e}). Falling back to robust SQLite database.")

if engine is None:
    sqlite_url = "sqlite:///./medilens.db"
    logger.info(f"Using SQLite database engine at {sqlite_url}")
    engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
