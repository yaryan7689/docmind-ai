import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.parser import DocumentParser
from app.services.rag_engine import RAGEngine
from app.services.demo_data import SAMPLE_DOCUMENTS
from app.services import db

router = APIRouter(prefix="/api/documents", tags=["documents"])

# -----------------------------------------------------------------------
# In-memory write-through cache: fast reads, DB-backed persistence
# Populated on startup from SQLite; all mutations go to both.
# -----------------------------------------------------------------------
DOCUMENTS_STORE: Dict[str, Dict[str, Any]] = {}


def _load_cache_from_db() -> None:
    """Populate the in-memory cache from SQLite on startup."""
    global DOCUMENTS_STORE
    DOCUMENTS_STORE.clear()
    for meta in db.list_documents():
        full = db.load_document(meta["id"])
        if full:
            DOCUMENTS_STORE[full["id"]] = full


def _seed_demo_docs() -> None:
    """Seed the DB with sample documents the first time (empty DB)."""
    for doc in SAMPLE_DOCUMENTS:
        doc_copy = dict(doc)
        doc_copy["chunks"] = RAGEngine.chunk_document(doc_copy)
        db.save_document(doc_copy)


def _init_store() -> None:
    """Initialize DB + cache. Seeds demo docs if DB is empty."""
    db.init_db()
    if db.count_documents() == 0:
        _seed_demo_docs()
    _load_cache_from_db()


_init_store()


@router.get("")
def list_documents() -> List[Dict[str, Any]]:
    """
    Returns list of all documents with high-level metadata.
    """
    result = []
    for doc in DOCUMENTS_STORE.values():
        result.append({
            "id":           doc.get("id"),
            "filename":     doc.get("filename"),
            "file_type":    doc.get("file_type"),
            "category":     doc.get("category", "Uploaded"),
            "total_pages":  doc.get("total_pages", 1),
            "word_count":   doc.get("word_count", 0),
            "char_count":   doc.get("char_count", 0),
            "chunks_count": len(doc.get("chunks", [])),
            "has_summary":  bool(doc.get("summary")),
            "has_entities": bool(doc.get("entities")),
        })
    return result


@router.get("/{doc_id}")
def get_document(doc_id: str) -> Dict[str, Any]:
    """
    Returns full document details including pages and chunks.
    """
    if doc_id not in DOCUMENTS_STORE:
        raise HTTPException(status_code=404, detail="Document not found")
    return DOCUMENTS_STORE[doc_id]


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Uploads and parses a new document (PDF, DOCX, TXT, CSV, MD).
    Persisted to SQLite so it survives server restarts.
    """
    try:
        contents = await file.read()
        filename = file.filename or "uploaded_file.txt"

        parsed_data = DocumentParser.parse_file(contents, filename)
        doc_id = f"doc-{uuid.uuid4().hex[:8]}"

        doc_record: Dict[str, Any] = {
            "id":          doc_id,
            "filename":    filename,
            "file_type":   parsed_data["file_type"],
            "category":    "Custom Upload",
            "total_pages": parsed_data["total_pages"],
            "pages":       parsed_data["pages"],
            "full_text":   parsed_data["full_text"],
            "word_count":  parsed_data["word_count"],
            "char_count":  parsed_data["char_count"],
            "chunks":      RAGEngine.chunk_document(parsed_data),
            "summary":     None,
            "entities":    None,
        }

        # Persist to DB + add to cache
        db.save_document(doc_record)
        DOCUMENTS_STORE[doc_id] = doc_record

        return {
            "id":           doc_id,
            "filename":     filename,
            "file_type":    parsed_data["file_type"],
            "total_pages":  parsed_data["total_pages"],
            "word_count":   parsed_data["word_count"],
            "chunks_count": len(doc_record["chunks"]),
            "message":      "Document ingested, indexed and saved to persistent storage",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse document: {str(e)}")


@router.delete("/{doc_id}")
def delete_document(doc_id: str) -> Dict[str, str]:
    """
    Deletes a document from both cache and persistent storage.
    """
    if doc_id not in DOCUMENTS_STORE:
        raise HTTPException(status_code=404, detail="Document not found")
    del DOCUMENTS_STORE[doc_id]
    db.delete_document(doc_id)
    return {"message": "Document deleted successfully"}


@router.post("/reset")
def reset_to_demo() -> Dict[str, str]:
    """
    Wipes the DB and re-seeds original sample documents.
    """
    # Delete all existing docs from DB
    for doc_id in list(DOCUMENTS_STORE.keys()):
        db.delete_document(doc_id)
    # Re-seed and reload
    _seed_demo_docs()
    _load_cache_from_db()
    return {"message": "Documents reset to demo defaults (persisted)"}
