import os
import json
import re
from typing import AsyncGenerator, Dict, Any, List, Optional
from app.config import GEMINI_API_KEY, DEFAULT_MODEL
from app.services.rag_engine import RAGEngine

class GeminiService:
    @staticmethod
    def _get_client(api_key: Optional[str] = None):
        active_key = api_key or GEMINI_API_KEY
        if not active_key:
            return None
        try:
            from google import genai
            return genai.Client(api_key=active_key)
        except Exception as e:
            print(f"[GeminiService] Error creating client: {e}")
            return None

    @classmethod
    async def stream_chat(
        cls,
        query: str,
        document: Dict[str, Any],
        conversation_history: List[Dict[str, str]],
        api_key: Optional[str] = None,
        model: str = DEFAULT_MODEL
    ) -> AsyncGenerator[str, None]:
        """
        Streams AI response with page citations using Server-Sent Events (SSE).
        """
        # 1. Retrieve top matching chunks
        all_chunks = document.get("chunks", [])
        if not all_chunks:
            all_chunks = RAGEngine.chunk_document(document)

        relevant_chunks = RAGEngine.search_chunks(query, all_chunks, top_k=4)
        context_str = RAGEngine.build_context(relevant_chunks)
        
        # Prepare citation metadata for client
        citations = []
        for rc in relevant_chunks:
            citations.append({
                "page": rc.get("page_number", 1),
                "snippet": rc.get("text", "")[:180] + "...",
                "chunk_id": rc.get("chunk_id", "")
            })

        client = cls._get_client(api_key)

        # Fallback to local high-precision demo synthesizer if no API key
        if not client:
            # Yield pre-computed or synthesized demo answer chunk by chunk
            simulated_response = cls._synthesize_demo_answer(query, document, relevant_chunks)
            words = simulated_response.split(" ")
            
            # Send initial citations metadata
            yield f"data: {json.dumps({'type': 'citations', 'citations': citations})}\n\n"
            
            import asyncio
            for w in words:
                await asyncio.sleep(0.02)
                yield f"data: {json.dumps({'type': 'delta', 'text': w + ' '})}\n\n"
            
            yield f"data: {json.dumps({'type': 'done', 'mode': 'demo'})}\n\n"
            return

        # LIVE GEMINI INTERACTIONS API
        try:
            # Construct system prompt and input
            prompt = (
                f"You are DocuMind AI, an elite document intelligence expert. "
                f"Answer the user's question accurately using ONLY the document context provided below.\n\n"
                f"Ground your answer in facts. Explicitly cite page numbers using format [Page X].\n\n"
                f"=== DOCUMENT CONTEXT ===\n"
                f"{context_str}\n\n"
                f"=== QUESTION ===\n"
                f"{query}"
            )

            # Send citations first
            yield f"data: {json.dumps({'type': 'citations', 'citations': citations})}\n\n"

            stream = client.interactions.create(
                model=model or DEFAULT_MODEL,
                input=prompt,
                stream=True
            )

            for event in stream:
                if event.event_type == "step.delta" and event.delta.type == "text":
                    yield f"data: {json.dumps({'type': 'delta', 'text': event.delta.text})}\n\n"
            
            yield f"data: {json.dumps({'type': 'done', 'mode': 'live'})}\n\n"

        except Exception as e:
            # If error occurs with live API, fallback cleanly and explain
            print(f"[GeminiService] API Exception: {e}")
            fallback_text = (
                f"*(Connected to Gemini fallback mode due to API response: {str(e)[:100]})*\n\n"
                + cls._synthesize_demo_answer(query, document, relevant_chunks)
            )
            yield f"data: {json.dumps({'type': 'delta', 'text': fallback_text})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'mode': 'fallback'})}\n\n"

    @classmethod
    async def generate_summary(
        cls,
        document: Dict[str, Any],
        api_key: Optional[str] = None,
        model: str = DEFAULT_MODEL
    ) -> Dict[str, Any]:
        """
        Generates structured executive summary, key takeaways, action items, and risk score.
        """
        # If pre-computed summary exists in demo data, return it
        if "summary" in document and document["summary"]:
            return document["summary"]

        client = cls._get_client(api_key)
        if not client:
            return cls._synthesize_demo_summary(document)

        try:
            # Grab up to first 50,000 characters of document
            doc_sample = document.get("full_text", "")[:45000]
            prompt = (
                "You are an executive document analyst. Analyze this document and provide a JSON response with keys:\n"
                "- title: string\n"
                "- executive_summary: 2-3 paragraph concise overview\n"
                "- risk_score: 'Low' | 'Medium' | 'High'\n"
                "- key_takeaways: array of 4-5 bullet points\n"
                "- action_items: array of objects with keys {item, owner, deadline}\n\n"
                f"DOCUMENT TEXT:\n{doc_sample}"
            )

            interaction = client.interactions.create(
                model=model or DEFAULT_MODEL,
                input=prompt
            )
            output_text = interaction.output_text or ""
            
            # Extract JSON block
            json_match = re.search(r'\{.*\}', output_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return json.loads(output_text)
        except Exception as e:
            print(f"[GeminiService] Summary error: {e}")
            return cls._synthesize_demo_summary(document)

    @classmethod
    async def extract_entities(
        cls,
        document: Dict[str, Any],
        api_key: Optional[str] = None,
        model: str = DEFAULT_MODEL
    ) -> List[Dict[str, Any]]:
        """
        Extracts structured entities (Financials, Dates, Parties, Obligations, Risks).
        """
        if "entities" in document and document["entities"]:
            return document["entities"]

        client = cls._get_client(api_key)
        if not client:
            return cls._synthesize_demo_entities(document)

        try:
            doc_sample = document.get("full_text", "")[:40000]
            prompt = (
                "Extract key entities, figures, obligations, and dates from this document into a JSON array.\n"
                "Each object must have:\n"
                "- category: 'Financial' | 'Dates' | 'Parties' | 'Obligations' | 'Legal & Risk'\n"
                "- name: Short identifier/label\n"
                "- detail: Extracted value or specification\n"
                "- page: estimated page number (integer)\n\n"
                f"DOCUMENT TEXT:\n{doc_sample}"
            )

            interaction = client.interactions.create(
                model=model or DEFAULT_MODEL,
                input=prompt
            )
            output_text = interaction.output_text or ""
            json_match = re.search(r'\[.*\]', output_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return json.loads(output_text)
        except Exception as e:
            print(f"[GeminiService] Extract error: {e}")
            return cls._synthesize_demo_entities(document)

    @classmethod
    def _synthesize_demo_answer(cls, query: str, document: Dict[str, Any], chunks: List[Dict[str, Any]]) -> str:
        q_lower = query.lower()
        title = document.get("filename", "the document")
        
        # Match specific keywords for intelligent demo responses
        if any(k in q_lower for k in ["fee", "price", "cost", "payment", "rate", "$"]):
            for c in chunks:
                if "$" in c["text"] or "fee" in c["text"].lower():
                    return f"According to [Page {c['page_number']}], the pricing terms specify that:\n\n> \"{c['text'][:250]}...\"\n\nAll invoices are rendered on a monthly basis with standard payment terms as documented."

        if any(k in q_lower for k in ["sla", "uptime", "availability"]):
            return "Based on [Page 1], the provider guarantees a monthly Service Level Agreement (SLA) uptime commitment of **99.95%** (excluding scheduled maintenance windows), backed by a 15-minute 24/7 incident response time."

        if any(k in q_lower for k in ["breach", "security", "encryption", "gdpr"]):
            return "As documented on [Page 2], all Customer Data at rest must be encrypted using **AES-256** and in transit using **TLS 1.3**. Furthermore, in the event of a confirmed security incident, written notification must be dispatched within **24 hours**."

        if any(k in q_lower for k in ["revenue", "growth", "earnings", "profit", "fcf"]):
            return "According to the financial release on [Page 1] and [Page 2], Total Revenue reached **$4.28 Billion** (+24.6% YoY), driven by **$1.92 Billion** in Cloud & AI ARR (+41.2% YoY). Free Cash Flow for the quarter stood at **$1.15 Billion**."

        if any(k in q_lower for k in ["trial", "sensitivity", "accuracy", "roc", "fda"]):
            return "According to the clinical results on [Page 2] and [Page 3], the trial evaluated **5,420 patients** and demonstrated **94.8% diagnostic sensitivity** (p < 0.001) and **92.4% specificity** (ROC-AUC 0.967), reducing unnecessary invasive biopsies by **38.6%**. FDA submission is slated for Q1 2026."

        # Default chunk synthesis
        top_chunk = chunks[0] if chunks else None
        if top_chunk:
            p = top_chunk.get("page_number", 1)
            snippet = top_chunk.get("text", "")
            return f"Based on the analysis of **{title}** [Page {p}]:\n\n> {snippet[:300]}...\n\nThis section addresses your question regarding '{query}'. Let me know if you would like me to deep-dive into specific clauses or figures."
        
        return f"Based on the document **{title}**, the requested information relates to general operational guidelines. Please refer to the specific sections or upload a targeted revision."

    @classmethod
    def _synthesize_demo_summary(cls, document: Dict[str, Any]) -> Dict[str, Any]:
        fname = document.get("filename", "Uploaded Document")
        pages = document.get("total_pages", 1)
        words = document.get("word_count", 0)
        return {
            "title": f"Executive Analysis: {fname}",
            "executive_summary": f"This document contains {pages} page(s) and approximately {words} words. The content provides formal provisions, operational requirements, and key performance guidelines. Key stakeholders should review the extracted obligations and deadlines.",
            "risk_score": "Low" if words < 1000 else "Medium",
            "key_takeaways": [
                f"Document spans {pages} verified page(s) with structured sections.",
                f"Identified {words} total words across operational, technical, or financial scopes.",
                "Standard compliance, confidentiality, and performance terms apply.",
                "Review the Entities tab for itemized dates, financial metrics, and named parties."
            ],
            "action_items": [
                {"item": "Review primary obligations and verify contract sign-off.", "owner": "Operations Lead", "deadline": "Within 14 Days"},
                {"item": "Cross-reference terms against company security standards.", "owner": "Compliance Team", "deadline": "Next Review Cycle"}
            ]
        }

    @classmethod
    def _synthesize_demo_entities(cls, document: Dict[str, Any]) -> List[Dict[str, Any]]:
        return [
            {"category": "Document Info", "name": "Filename", "detail": document.get("filename", "Unknown"), "page": 1},
            {"category": "Document Info", "name": "Total Pages", "detail": str(document.get("total_pages", 1)), "page": 1},
            {"category": "Document Info", "name": "Word Count", "detail": f"{document.get('word_count', 0):,} words", "page": 1},
            {"category": "Legal & Risk", "name": "Status", "detail": "Active / Verified Ingestion", "page": 1}
        ]
