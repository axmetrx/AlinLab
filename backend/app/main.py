import sys
import os
import logging

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
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

# Seed database with initial admin and student accounts
try:
    seed_data()
except Exception as e:
    logger.warning(f"Could not auto-seed database: {e}")

app = FastAPI(
    title="AlinLab Learning Platform API",
    description="Backend API for AlinLab Online Learning Platform",
    version="1.0.0"
)

# Mount static uploads directory for uploaded local files
app.mount("/uploads", staticfiles.StaticFiles(directory="uploads"), name="uploads")

# Enable CORS for frontend development
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
def root():
    return {
        "status": "online",
        "app": "AlinLab Online Learning Platform API",
        "version": "1.0.0"
    }
