import os
import sys
from pathlib import Path

# Ensure backend directory is in sys.path regardless of where Python is invoked
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.documents import router as documents_router
from app.routes.analysis import router as analysis_router

app = FastAPI(
    title="DocuMind AI API",
    description="Multimodal Document Intelligence and Analysis Platform",
    version="1.0.0"
)

# Allow Cross-Origin Requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents_router)
app.include_router(analysis_router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "DocuMind AI Platform API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "engine": "FastAPI + Gemini 3.8 Flash (Dual Mode)",
        "features": ["multimodal-ingestion", "page-citations", "smart-extraction", "doc-diff"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
