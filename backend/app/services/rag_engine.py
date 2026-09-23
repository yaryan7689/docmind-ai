import re
import math
from typing import List, Dict, Any, Tuple
from collections import Counter

class RAGEngine:
    @staticmethod
    def chunk_document(doc: Dict[str, Any], chunk_size: int = 250, chunk_overlap: int = 40) -> List[Dict[str, Any]]:
        """
        Splits pages into overlapping text chunks, preserving page numbers and explicit page tags.
        """
        chunks = []
        chunk_counter = 0

        for page in doc.get("pages", []):
            page_num = page.get("page_number", 1)
            page_text = page.get("text", "").strip()
            if not page_text:
                continue

            words = page_text.split()
            if len(words) <= chunk_size:
                chunks.append({
                    "chunk_id": f"chunk_{chunk_counter}",
                    "page_number": page_num,
                    "text": f"[Page {page_num}] {page_text}",
                    "raw_text": page_text,
                    "word_count": len(words)
                })
                chunk_counter += 1
                continue

            # Sliding window over words
            start = 0
            while start < len(words):
                end = min(start + chunk_size, len(words))
                chunk_slice = words[start:end]
                chunk_str = " ".join(chunk_slice)
                
                chunks.append({
                    "chunk_id": f"chunk_{chunk_counter}",
                    "page_number": page_num,
                    "text": f"[Page {page_num}] {chunk_str}",
                    "raw_text": chunk_str,
                    "word_count": len(chunk_slice)
                })
                chunk_counter += 1
                
                if end == len(words):
                    break
                start += (chunk_size - chunk_overlap)

        return chunks

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        return [w.lower() for w in re.findall(r'\b[a-zA-Z0-9_\-\$]+\b', text) if len(w) > 1]

    @classmethod
    def search_chunks(cls, query: str, chunks: List[Dict[str, Any]], top_k: int = 10) -> List[Dict[str, Any]]:
        """
        Retrieves chunks matching the query using BM25 with multi-page awareness:
        - Prioritizes chunks from specific pages if user asks e.g. "what is on page 3"
        - Balances retrieval across ALL pages if user asks comprehensive / summary questions
        - Ensures page diversity so single pages do not crowd out other pages
        """
        if not chunks:
            return []

        q_lower = query.lower()
        query_tokens = cls._tokenize(query)

        # Detect specific page requests like "page 2", "pages 1 and 3", "pg 4"
        mentioned_pages = [int(p) for p in re.findall(r'\b(?:page|pages|pg|p\.?)\s*(\d+)\b', q_lower)]
        
        # Detect whole-document comprehensive queries
        is_comprehensive = any(w in q_lower for w in [
            "all", "entire", "whole", "every", "summarize", "summary", 
            "overview", "full", "analyze", "pages", "document", "everything", "across"
        ])

        # If user wants a comprehensive overview or analysis of all pages
        if is_comprehensive and len(chunks) > 0:
            # Group chunks by page
            pages_dict: Dict[int, List[Dict[str, Any]]] = {}
            for c in chunks:
                p_num = c.get("page_number", 1)
                pages_dict.setdefault(p_num, []).append(c)

            # Collect representative chunks from EVERY page
            balanced_results = []
            for p_num in sorted(pages_dict.keys()):
                page_chunks = pages_dict[p_num]
                # Pick up to 2 representative chunks per page
                balanced_results.extend(page_chunks[:2])

            if len(balanced_results) <= top_k * 2:
                return balanced_results
            return balanced_results[:max(top_k, len(pages_dict))]

        # Calculate BM25 document frequencies
        doc_count = len(chunks)
        df = Counter()
        chunk_token_lists = []
        for c in chunks:
            tokens = cls._tokenize(c["text"])
            chunk_token_lists.append(tokens)
            unique_t = set(tokens)
            for t in unique_t:
                df[t] += 1

        scored_chunks = []
        avg_len = sum(len(tl) for tl in chunk_token_lists) / max(1, doc_count)
        k1 = 1.2
        b = 0.75

        for idx, c in enumerate(chunks):
            tokens = chunk_token_lists[idx]
            doc_len = len(tokens)
            tf = Counter(tokens)
            score = 0.0

            for q in query_tokens:
                if q in tf:
                    doc_freq = df.get(q, 1)
                    idf = math.log(1.0 + (doc_count - doc_freq + 0.5) / (doc_freq + 0.5))
                    term_score = idf * ((tf[q] * (k1 + 1.0)) / (tf[q] + k1 * (1.0 - b + b * (doc_len / avg_len))))
                    score += term_score

            # Boost if query phrase is directly matched
            if q_lower in c["text"].lower():
                score += 5.0

            # Huge boost if chunk belongs to a specifically requested page
            if c.get("page_number") in mentioned_pages:
                score += 25.0

            if score > 0:
                scored_chunks.append((score, c))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)

        if not scored_chunks:
            # If no matches, return balanced sample from all pages
            seen_pages = set()
            sample = []
            for c in chunks:
                p = c.get("page_number", 1)
                if p not in seen_pages:
                    sample.append(c)
                    seen_pages.add(p)
            for c in chunks:
                if len(sample) >= top_k:
                    break
                if c not in sample:
                    sample.append(c)
            return sample[:top_k]

        # Apply page diversity so top_k is not monopolized by a single page
        results = []
        page_counts = Counter()
        max_per_page = max(2, top_k // 3)

        for score, c in scored_chunks:
            p = c.get("page_number", 1)
            if page_counts[p] < max_per_page or len(results) < top_k // 2:
                results.append(c)
                page_counts[p] += 1
            if len(results) >= top_k:
                break

        # If we didn't fill top_k, add remaining highest scored
        if len(results) < top_k:
            for score, c in scored_chunks:
                if c not in results:
                    results.append(c)
                if len(results) >= top_k:
                    break

        return results

    @staticmethod
    def build_context(ranked_chunks: List[Dict[str, Any]]) -> str:
        """
        Formats retrieved chunks into grounded multi-page context string with citation markers.
        """
        context_parts = []
        for c in ranked_chunks:
            p = c.get("page_number", 1)
            raw = c.get("raw_text", c.get("text", ""))
            context_parts.append(
                f"=== [DOCUMENT EXCERPT: Page {p}] ===\n{raw}"
            )
        return "\n\n---\n\n".join(context_parts)
