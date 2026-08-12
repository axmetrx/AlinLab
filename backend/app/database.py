import os
import logging
from dotenv import load_dotenv

# Load .env file automatically
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import psycopg2

logger = logging.getLogger("alinlab.database")

POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "Axmet2009")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "alinlab")

DEFAULT_PG_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_PG_URL)

def ensure_postgres_db_exists(url: str):
    if not url.startswith("postgresql"):
        return
    
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        username = parsed.username or POSTGRES_USER
        password = parsed.password or POSTGRES_PASSWORD
        hostname = parsed.hostname or POSTGRES_HOST
        port = parsed.port or int(POSTGRES_PORT)
        dbname = parsed.path.lstrip("/") or POSTGRES_DB

        conn = psycopg2.connect(
            dbname="postgres",
            user=username,
            password=password,
            host=hostname,
            port=port,
            client_encoding="UTF8"
        )
        conn.autocommit = True
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (dbname,))
        if not cursor.fetchone():
            cursor.execute(f'CREATE DATABASE "{dbname}"')
            logger.info(f"Created PostgreSQL database '{dbname}'")
        cursor.close()
        conn.close()
    except Exception as e:
        logger.warning(f"PostgreSQL database check warning: {e}")

def get_engine(url: str):
    if url.startswith("sqlite"):
        return create_engine(url, connect_args={"check_same_thread": False})

    ensure_postgres_db_exists(url)

    try:
        engine = create_engine(url, pool_pre_ping=True)
        with engine.connect() as conn:
            pass
        logger.info(f"Successfully connected to PostgreSQL database at {url}")
        return engine
    except Exception as e:
        logger.warning(f"Could not connect to PostgreSQL ({e}). Falling back to SQLite.")
        return create_engine("sqlite:///./alinlab.db", connect_args={"check_same_thread": False})

engine = get_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
