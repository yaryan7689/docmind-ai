"""
db.py — SQLite persistent storage for DocuMind AI.
Uses Python's built-in sqlite3 (no extra packages needed).
DB file: backend/documind.db
"""
import sqlite3
import json
import os
from typing import Dict, Any, List, Optional

# DB stored one level up from app/ (inside backend/)
_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "documind.db")
_DB_PATH = os.path.normpath(_DB_PATH)


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(_DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Create tables if they don't exist."""
    with _get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id          TEXT PRIMARY KEY,
                filename    TEXT NOT NULL,
                file_type   TEXT,
                category    TEXT DEFAULT 'Uploaded',
                total_pages INTEGER DEFAULT 1,
                word_count  INTEGER DEFAULT 0,
                char_count  INTEGER DEFAULT 0,
                created_at  TEXT DEFAULT (datetime('now'))
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS document_data (
                doc_id       TEXT PRIMARY KEY,
                pages_json   TEXT DEFAULT '[]',
                full_text    TEXT DEFAULT '',
                chunks_json  TEXT DEFAULT '[]',
                summary_json TEXT,
                entities_json TEXT,
                FOREIGN KEY (doc_id) REFERENCES documents(id) ON DELETE CASCADE
            )
        """)
        conn.commit()


def count_documents() -> int:
    """Returns total number of documents stored."""
    with _get_conn() as conn:
        row = conn.execute("SELECT COUNT(*) as cnt FROM documents").fetchone()
        return row["cnt"] if row else 0


def save_document(doc: Dict[str, Any]) -> None:
    """Insert or replace a full document record."""
    with _get_conn() as conn:
        conn.execute("""
            INSERT OR REPLACE INTO documents
              (id, filename, file_type, category, total_pages, word_count, char_count)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            doc["id"],
            doc.get("filename", ""),
            doc.get("file_type", "txt"),
            doc.get("category", "Uploaded"),
            doc.get("total_pages", 1),
            doc.get("word_count", 0),
            doc.get("char_count", 0),
        ))
        conn.execute("""
            INSERT OR REPLACE INTO document_data
              (doc_id, pages_json, full_text, chunks_json, summary_json, entities_json)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            doc["id"],
            json.dumps(doc.get("pages", []), ensure_ascii=False),
            doc.get("full_text", ""),
            json.dumps(doc.get("chunks", []), ensure_ascii=False),
            json.dumps(doc.get("summary"), ensure_ascii=False) if doc.get("summary") else None,
            json.dumps(doc.get("entities"), ensure_ascii=False) if doc.get("entities") else None,
        ))
        conn.commit()


def load_document(doc_id: str) -> Optional[Dict[str, Any]]:
    """Load a full document record (metadata + data). Returns None if not found."""
    with _get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM documents WHERE id = ?", (doc_id,)
        ).fetchone()
        if not row:
            return None
        data_row = conn.execute(
            "SELECT * FROM document_data WHERE doc_id = ?", (doc_id,)
        ).fetchone()

    doc = dict(row)
    if data_row:
        doc["pages"]    = json.loads(data_row["pages_json"] or "[]")
        doc["full_text"] = data_row["full_text"] or ""
        doc["chunks"]   = json.loads(data_row["chunks_json"] or "[]")
        doc["summary"]  = json.loads(data_row["summary_json"]) if data_row["summary_json"] else None
        doc["entities"] = json.loads(data_row["entities_json"]) if data_row["entities_json"] else None
    else:
        doc["pages"] = []
        doc["full_text"] = ""
        doc["chunks"] = []
        doc["summary"] = None
        doc["entities"] = None
    return doc


def list_documents() -> List[Dict[str, Any]]:
    """Return lightweight metadata for all documents (no pages/chunks)."""
    with _get_conn() as conn:
        rows = conn.execute(
            "SELECT d.*, dd.summary_json, dd.entities_json FROM documents d "
            "LEFT JOIN document_data dd ON d.id = dd.doc_id "
            "ORDER BY d.created_at ASC"
        ).fetchall()
    result = []
    for row in rows:
        result.append({
            "id":          row["id"],
            "filename":    row["filename"],
            "file_type":   row["file_type"],
            "category":    row["category"],
            "total_pages": row["total_pages"],
            "word_count":  row["word_count"],
            "char_count":  row["char_count"],
            "has_summary":  bool(row["summary_json"]),
            "has_entities": bool(row["entities_json"]),
        })
    return result


def delete_document(doc_id: str) -> bool:
    """Delete a document and its data. Returns True if deleted."""
    with _get_conn() as conn:
        cur = conn.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
        conn.commit()
        return cur.rowcount > 0


def update_summary(doc_id: str, summary: Dict[str, Any]) -> None:
    """Persist summary for an existing document."""
    with _get_conn() as conn:
        conn.execute(
            "UPDATE document_data SET summary_json = ? WHERE doc_id = ?",
            (json.dumps(summary, ensure_ascii=False), doc_id)
        )
        conn.commit()


def update_entities(doc_id: str, entities: List[Dict[str, Any]]) -> None:
    """Persist extracted entities for an existing document."""
    with _get_conn() as conn:
        conn.execute(
            "UPDATE document_data SET entities_json = ? WHERE doc_id = ?",
            (json.dumps(entities, ensure_ascii=False), doc_id)
        )
        conn.commit()
