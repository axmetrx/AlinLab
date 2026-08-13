import sys
import os
import logging
import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import staticfiles


from app.database import engine, Base
from app.routers import auth, student, admin
from app.seed import seed_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("alinlab.main")

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

# Create tables
Base.metadata.create_all(bind=engine)

# Execute DB migrations to guarantee new columns exist in PostgreSQL
try:
    from app.database import run_db_migrations
    run_db_migrations(engine)
except Exception as e:
    logger.warning(f"Failed to run schema migrations: {e}")

# Seed database with initial admin and student accounts
try:
    seed_data()
except Exception as e:
    logger.warning(f"Could not auto-seed database: {e}")

app = FastAPI(
    title="Okademalin Learning Platform API",
    description="Backend API for Okademalin Online Learning Platform",
    version="1.0.0"
)

# Global exception handler ensuring CORS headers on all errors
@app.exception_handler(Exception)
def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception handling request {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "*"}
    )

# Mount static uploads directory for uploaded local files
app.mount("/uploads", staticfiles.StaticFiles(directory="uploads"), name="uploads")

# Enable CORS for frontend development and production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(student.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {
        "status": "ok",
        "message": "Okademalin API is operational",
        "app": "Okademalin Online Learning Platform API",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
