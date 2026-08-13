import sys
import os
import logging
import datetime
import traceback

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base
from app.routers import auth, student, admin
from app.seed import seed_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("okademalin.main")

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


# ---- CORS: Must be FIRST middleware added ----
# Note: allow_credentials=True is incompatible with allow_origins=["*"]
# per the CORS spec. We use allow_credentials=False with wildcard origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# ---- Catch-all error middleware that guarantees CORS on 500s ----
class CatchAllErrorMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            logger.error(f"Unhandled error on {request.method} {request.url}: {exc}")
            logger.error(traceback.format_exc())
            return JSONResponse(
                status_code=500,
                content={"detail": str(exc)},
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Headers": "*",
                },
            )

app.add_middleware(CatchAllErrorMiddleware)


# Mount static uploads directory for uploaded local files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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
