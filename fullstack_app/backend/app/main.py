import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base
from app.api.auth_routes import router as auth_router
from app.api.report_routes import router as report_router
from app.api.chat_routes import router as chat_router
from app.sample_reports import init_sample_reports

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("medilens")

# Create database tables
Base.metadata.create_all(bind=engine)

# Ensure sample reports exist
try:
    init_sample_reports()
except Exception as e:
    logger.warning(f"Could not initialize sample reports: {e}")

app = FastAPI(
    title="MediLens API",
    description="AI Medical Report Summarizer & Clinical Biomarker Intelligence System",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth_router, prefix="/api")
app.include_router(report_router, prefix="/api")
app.include_router(chat_router, prefix="/api")

# Static files for uploaded reports
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "MediLens",
        "version": "1.0.0",
        "disclaimer": "Informational and educational tool only. Does not replace professional medical diagnosis or treatment."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
