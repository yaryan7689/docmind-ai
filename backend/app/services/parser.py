import io
import csv
from pathlib import Path
from typing import List, Dict, Any, Optional
import pypdf
import pdfplumber
import docx

class DocumentParser:
    @staticmethod
    def parse_file(file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Parses uploaded file bytes into structured multi-page document model:
        {
            "filename": str,
            "file_type": str,
            "total_pages": int,
            "pages": [{"page_number": int, "text": str, "tables": List[List[str]]}],
            "full_text": str,
            "word_count": int,
            "char_count": int,
        }
        """
        extension = Path(filename).suffix.lower()

        if extension == ".pdf":
            return DocumentParser._parse_pdf(file_bytes, filename)
        elif extension in [".docx", ".doc"]:
            return DocumentParser._parse_docx(file_bytes, filename)
        elif extension == ".csv":
            return DocumentParser._parse_csv(file_bytes, filename)
        elif extension in [".txt", ".md", ".json", ".log"]:
            return DocumentParser._parse_text(file_bytes, filename)
        else:
            # Fallback to UTF-8 text decode
            return DocumentParser._parse_text(file_bytes, filename)

    @staticmethod
    def _parse_pdf(file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Robustly parses every single page of a PDF document, ensuring all pages
        from 1 to N are preserved and clearly demarcated.
        """
        pages_data = []
        full_text_list = []

        # Read page count and raw text using pypdf as reliable baseline
        pypdf_pages = []
        try:
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            for p_idx, page in enumerate(reader.pages):
                txt = page.extract_text() or ""
                pypdf_pages.append(txt)
        except Exception as e:
            print(f"[DocumentParser] pypdf read error: {e}")

        total_pages = max(1, len(pypdf_pages))

        # Try pdfplumber for high fidelity text & tables on every page
        plumber_pdf = None
        try:
            plumber_pdf = pdfplumber.open(io.BytesIO(file_bytes))
        except Exception as e:
            print(f"[DocumentParser] pdfplumber open error: {e}")

        for idx in range(total_pages):
            page_num = idx + 1
            page_text = ""
            tables = []

            # 1. Try extracting with pdfplumber
            if plumber_pdf and idx < len(plumber_pdf.pages):
                try:
                    p = plumber_pdf.pages[idx]
                    page_text = p.extract_text() or ""
                    try:
                        raw_tables = p.extract_tables()
                        if raw_tables:
                            tables = [t for t in raw_tables if t]
                    except Exception:
                        pass
                except Exception as p_err:
                    print(f"[DocumentParser] pdfplumber page {page_num} error: {p_err}")

            # 2. Fallback to pypdf text if pdfplumber was empty
            if not page_text.strip() and idx < len(pypdf_pages):
                page_text = pypdf_pages[idx]

            # 3. If page still has no text, mark it as non-empty so indexing captures it
            clean_text = page_text.strip()
            if not clean_text:
                if tables:
                    clean_text = f"[Page {page_num}: Contains {len(tables)} extracted tabular data set(s)]"
                else:
                    clean_text = f"[Page {page_num}: Graphic, scanned, or non-textual layout]"

            pages_data.append({
                "page_number": page_num,
                "text": clean_text,
                "tables": tables
            })

            full_text_list.append(f"--- [Page {page_num} of {total_pages}] ---\n{clean_text}")

        if plumber_pdf:
            try:
                plumber_pdf.close()
            except Exception:
                pass

        full_text = "\n\n".join(full_text_list)
        return {
            "filename": filename,
            "file_type": "pdf",
            "total_pages": total_pages,
            "pages": pages_data,
            "full_text": full_text,
            "word_count": len(full_text.split()),
            "char_count": len(full_text)
        }

    @staticmethod
    def _parse_docx(file_bytes: bytes, filename: str) -> Dict[str, Any]:
        doc = docx.Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        
        # Approximate 400 words per page
        full_raw_text = "\n\n".join(paragraphs)
        words = full_raw_text.split()
        words_per_page = 400
        total_pages = max(1, (len(words) + words_per_page - 1) // words_per_page)

        pages_data = []
        full_text_list = []
        for p_idx in range(total_pages):
            start = p_idx * words_per_page
            end = start + words_per_page
            chunk_words = words[start:end]
            page_text = " ".join(chunk_words)
            page_num = p_idx + 1

            pages_data.append({
                "page_number": page_num,
                "text": page_text,
                "tables": []
            })
            full_text_list.append(f"--- [Page {page_num} of {total_pages}] ---\n{page_text}")

        full_text = "\n\n".join(full_text_list)
        return {
            "filename": filename,
            "file_type": "docx",
            "total_pages": total_pages,
            "pages": pages_data,
            "full_text": full_text,
            "word_count": len(words),
            "char_count": len(full_text)
        }

    @staticmethod
    def _parse_csv(file_bytes: bytes, filename: str) -> Dict[str, Any]:
        text_content = file_bytes.decode("utf-8", errors="replace")
        reader = csv.reader(io.StringIO(text_content))
        rows = list(reader)
        
        # Format as markdown table
        table_lines = []
        if rows:
            table_lines.append("| " + " | ".join(rows[0]) + " |")
            table_lines.append("| " + " | ".join(["---"] * len(rows[0])) + " |")
            for r in rows[1:]:
                table_lines.append("| " + " | ".join(r) + " |")

        table_text = "\n".join(table_lines)
        full_text = f"--- [Page 1 of 1] ---\n{table_text}"

        return {
            "filename": filename,
            "file_type": "csv",
            "total_pages": 1,
            "pages": [{
                "page_number": 1,
                "text": table_text,
                "tables": [rows]
            }],
            "full_text": full_text,
            "word_count": len(full_text.split()),
            "char_count": len(full_text)
        }

    @staticmethod
    def _parse_text(file_bytes: bytes, filename: str) -> Dict[str, Any]:
        text = file_bytes.decode("utf-8", errors="replace")
        
        words = text.split()
        words_per_page = 450
        total_pages = max(1, (len(words) + words_per_page - 1) // words_per_page)

        pages_data = []
        full_text_list = []
        for p_idx in range(total_pages):
            start = p_idx * words_per_page
            end = start + words_per_page
            chunk_words = words[start:end]
            page_text = " ".join(chunk_words)
            page_num = p_idx + 1

            pages_data.append({
                "page_number": page_num,
                "text": page_text,
                "tables": []
            })
            full_text_list.append(f"--- [Page {page_num} of {total_pages}] ---\n{page_text}")

        full_text = "\n\n".join(full_text_list)
        return {
            "filename": filename,
            "file_type": Path(filename).suffix.lower().strip("."),
            "total_pages": total_pages,
            "pages": pages_data,
            "full_text": full_text,
            "word_count": len(words),
            "char_count": len(full_text)
        }
