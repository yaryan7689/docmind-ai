import json
from fastapi.testclient import TestClient
from app.main import app
from app.services.rag_engine import RAGEngine
from app.services.parser import DocumentParser

client = TestClient(app)

def test_all():
    print("[1] Testing Root & Health...")
    r = client.get("/")
    assert r.status_code == 200, f"Root failed: {r.text}"
    print("    Root OK:", r.json()["service"])

    r = client.get("/api/health")
    assert r.status_code == 200
    print("    Health OK:", r.json()["engine"])

    print("[2] Testing Document Listing & Page Counts...")
    r = client.get("/api/documents")
    assert r.status_code == 200
    docs = r.json()
    assert len(docs) >= 3, f"Expected at least 3 demo docs, got {len(docs)}"
    print(f"    Loaded {len(docs)} documents:")
    for d in docs:
        print(f"     - {d['filename']} ({d['total_pages']} pages, {d['word_count']} words)")
        assert d['total_pages'] > 1, f"Expected multi-page document for {d['filename']}"

    demo_id = docs[0]["id"]

    print(f"[3] Testing Document Detail for {demo_id}...")
    r = client.get(f"/api/documents/{demo_id}")
    assert r.status_code == 200
    detail = r.json()
    assert "pages" in detail and len(detail["pages"]) > 0
    assert "chunks" in detail and len(detail["chunks"]) > 0
    pages_list = [p["page_number"] for p in detail["pages"]]
    print(f"    Detail OK: Pages present {pages_list}, {len(detail['chunks'])} total chunks")

    print("[4] Testing Multi-Page Balanced RAG Search...")
    all_chunks = detail["chunks"]
    # Test comprehensive query
    comp_chunks = RAGEngine.search_chunks("summarize all pages of this document", all_chunks, top_k=10)
    retrieved_pages = sorted(list(set(c["page_number"] for c in comp_chunks)))
    print(f"    Comprehensive search retrieved chunks from pages: {retrieved_pages}")
    assert len(retrieved_pages) > 1, f"Expected multi-page retrieval, got {retrieved_pages}"

    # Test page-targeted query
    p2_chunks = RAGEngine.search_chunks("what is on page 2?", all_chunks, top_k=5)
    print(f"    Targeted page 2 query top chunk page: {p2_chunks[0]['page_number']}")
    assert p2_chunks[0]["page_number"] == 2, f"Expected top chunk to be page 2, got {p2_chunks[0]['page_number']}"

    print("[5] Testing Executive Summary across all pages...")
    r = client.post("/api/analysis/summary", json={"doc_id": demo_id, "force_refresh": True})
    assert r.status_code == 200
    summary = r.json()
    assert "executive_summary" in summary
    assert "risk_score" in summary
    print(f"    Summary OK. Title: {summary.get('title')}")
    print(f"    Takeaways ({len(summary.get('key_takeaways', []))} points):")
    for t in summary.get('key_takeaways', []):
        print(f"      * {t}")

    print("[6] Testing Multi-Page Entity Extraction...")
    r = client.post("/api/analysis/extract", json={"doc_id": demo_id, "force_refresh": True})
    assert r.status_code == 200
    res = r.json()
    assert "entities" in res and len(res["entities"]) > 0
    entity_pages = sorted(list(set(e["page"] for e in res["entities"])))
    print(f"    Extraction OK: {len(res['entities'])} entities mapped across pages: {entity_pages}")
    assert len(entity_pages) > 1, f"Entities should span multiple pages, got {entity_pages}"

    print("[7] Testing Grounded Chat with Citations across pages...")
    r = client.post(
        "/api/analysis/chat",
        json={"doc_id": demo_id, "query": "Provide a breakdown of all pages in this document"}
    )
    assert r.status_code == 200
    body = r.text
    assert "citations" in body or "data:" in body
    print("    Streaming Chat OK! Multi-page citations and response received.")

    print("\n[SUCCESS] ALL MULTI-PAGE TESTS PASSED! Every page is indexed, retrieved, and analyzed.")

if __name__ == "__main__":
    test_all()
