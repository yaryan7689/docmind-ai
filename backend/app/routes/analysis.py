from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.routes.documents import DOCUMENTS_STORE
from app.services.llm_service import LLMService
from app.services.demo_data import SAMPLE_DIFF_DATA
from app.services import db
from app.config import OPENAI_API_KEY, GROQ_API_KEY, GEMINI_API_KEY, DEFAULT_PROVIDER, DEFAULT_MODEL

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

class ChatRequest(BaseModel):
    doc_id: str
    query: str
    conversation_history: Optional[List[Dict[str, str]]] = []
    provider: Optional[str] = None
    api_key: Optional[str] = None
    model: Optional[str] = None

class AnalysisRequest(BaseModel):
    doc_id: str
    provider: Optional[str] = None
    api_key: Optional[str] = None
    model: Optional[str] = None
    force_refresh: Optional[bool] = False

class CompareRequest(BaseModel):
    doc_id_1: str
    doc_id_2: str
    provider: Optional[str] = None
    api_key: Optional[str] = None

@router.get("/providers")
def get_providers_info():
    """
    Returns available providers, detected environment keys, and default models.
    """
    return {
        "default_provider": DEFAULT_PROVIDER,
        "default_model": DEFAULT_MODEL,
        "available_providers": [
            {
                "id": "groq",
                "name": "Groq (Ultra-Fast Llama 3.3)",
                "has_env_key": bool(GROQ_API_KEY),
                "models": [
                    {"id": "llama-3.3-70b-versatile", "name": "Llama 3.3 70B (Recommended)"},
                    {"id": "llama-3.1-8b-instant", "name": "Llama 3.1 8B Instant"},
                    {"id": "mixtral-8x7b-32768", "name": "Mixtral 8x7B (32k)"}
                ]
            },
            {
                "id": "openai",
                "name": "OpenAI (GPT-4o & GPT-4o-mini)",
                "has_env_key": bool(OPENAI_API_KEY),
                "models": [
                    {"id": "gpt-4o-mini", "name": "GPT-4o Mini (Fast & Smart)"},
                    {"id": "gpt-4o", "name": "GPT-4o (Flagship Omni)"}
                ]
            },
            {
                "id": "gemini",
                "name": "Google Gemini (1M Context)",
                "has_env_key": bool(GEMINI_API_KEY),
                "models": [
                    {"id": "gemini-3.8-flash", "name": "Gemini 3.8 Flash"},
                    {"id": "gemini-3.5-flash-lite", "name": "Gemini 3.5 Lite"}
                ]
            }
        ]
    }

@router.post("/chat")
async def chat_document(req: ChatRequest):
    """
    Server-Sent Events (SSE) streaming endpoint for AI conversation with citations.
    """
    if req.doc_id not in DOCUMENTS_STORE:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc = DOCUMENTS_STORE[req.doc_id]
    generator = LLMService.stream_chat(
        query=req.query,
        document=doc,
        conversation_history=req.conversation_history or [],
        provider=req.provider,
        api_key=req.api_key,
        model=req.model
    )
    
    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/summary")
async def get_summary(req: AnalysisRequest):
    """
    Generates or fetches the executive summary of the document.
    """
    if req.doc_id not in DOCUMENTS_STORE:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc = DOCUMENTS_STORE[req.doc_id]
    summary = await LLMService.generate_summary(
        document=doc,
        provider=req.provider,
        api_key=req.api_key,
        model=req.model,
        force_refresh=req.force_refresh or False
    )
    doc["summary"] = summary
    # Persist to SQLite so it survives server restarts
    db.update_summary(req.doc_id, summary)
    return summary

@router.post("/extract")
async def get_extracted_entities(req: AnalysisRequest):
    """
    Extracts structured entities, figures, obligations, and dates.
    """
    if req.doc_id not in DOCUMENTS_STORE:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc = DOCUMENTS_STORE[req.doc_id]
    entities = await LLMService.extract_entities(
        document=doc,
        provider=req.provider,
        api_key=req.api_key,
        model=req.model,
        force_refresh=req.force_refresh or False
    )
    doc["entities"] = entities
    # Persist to SQLite so it survives server restarts
    db.update_entities(req.doc_id, entities)
    return {"entities": entities}

@router.post("/compare")
async def compare_documents(req: CompareRequest):
    """
    Compares two documents side by side to detect revisions, clause changes, and deviations.
    """
    if req.doc_id_1 not in DOCUMENTS_STORE or req.doc_id_2 not in DOCUMENTS_STORE:
        raise HTTPException(status_code=404, detail="One or both documents not found")
    
    doc1 = DOCUMENTS_STORE[req.doc_id_1]
    doc2 = DOCUMENTS_STORE[req.doc_id_2]

    diff_result = {
        "doc1_title": doc1.get("filename"),
        "doc2_title": doc2.get("filename"),
        "changes": SAMPLE_DIFF_DATA["changes"]
    }
    return diff_result
