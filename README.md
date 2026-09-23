# DocuMind AI 🧠📄
**Multimodal AI Document Intelligence & Assistant Platform**

DocuMind AI is an enterprise-grade document intelligence system designed for in-depth analysis, structured metadata extraction, comparative diffing, and grounded conversational Q&A with verifiable page-level source citations.

---

## 🌟 Key Capabilities

1. **Multimodal Document Ingestion**:
   - Ingests **PDFs**, **DOCX**, **TXT**, **CSV**, and **Markdown** documents.
   - Extracts page boundaries, formatted tables, and semantic token counts.

2. **Side-by-Side Interactive Workspace**:
   - **Interactive Document Viewer**: Page navigation, full-text search, and zoom controls.
   - **Clickable Citations**: Clicking a citation badge in chat or tables jumps directly to that page and highlights the source quote!

3. **Multi-Mode AI Intelligence Panel**:
   - 💬 **Grounded Q&A & Multi-turn Chat**: Real-time streaming SSE chat with pinpoint page citations.
   - 📋 **Executive Brief & Risk Meter**: Executive summary, risk rating (Low/Medium/High), bulleted takeaways, and actionable deadlines with assigned owners.
   - 📊 **Smart Entity & Clause Extraction**: Filterable relational catalog capturing financial metrics, dates, contractual obligations, and named parties with one-click **Export to CSV**.
   - ⚖️ **Contract Comparison & Diff**: Compares two document revisions side-by-side with visual change badges and impact commentary.

4. **Dual Engine Mode**:
   - 🟢 **Live Mode**: Directly connects to Google Gemini API (`gemini-3.8-flash` or `gemini-3.5-flash-lite`) via `google-genai` SDK.
   - 🟡 **Demo Sandbox Mode**: Instant out-of-the-box exploration with pre-loaded rich datasets (*Master Services Agreement*, *TechCorp Q3 Earnings*, *Clinical Trial Study*) and intelligent local RAG synthesis without requiring an immediate API key.

---

## 🚀 Quick Start

### 1-Click Launch (Windows)
Double-click `run.bat` or run:
```powershell
.\start.ps1
```
This automatically starts the FastAPI backend, launches the Vite development server, and opens `http://localhost:5173` in your default browser.

---

### Manual Launch

#### 1. Backend (FastAPI)
```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`

#### 2. Frontend (React + Vite)
```powershell
cd frontend
npm run dev
```
UI Application: `http://localhost:5173`

---

## ⚙️ Configuration & API Key

You can configure your Google Gemini API Key in two ways:
1. **Via UI**: Click **Settings** (gear icon) in the top-right header and enter your key. It will be stored in your browser's local storage.
2. **Via `.env`**: Create a `.env` file in the `backend/` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   DEFAULT_MODEL=gemini-3.8-flash
   ```

---

## 📂 Project Architecture

```
documind-ai/
├── backend/
│   ├── app/
│   │   ├── config.py             # App configurations & environment loader
│   │   ├── main.py               # FastAPI entrypoint with CORS & routes
│   │   ├── routes/
│   │   │   ├── documents.py      # Upload, listing, details, and delete endpoints
│   │   │   └── analysis.py       # Streaming chat, summary, extraction & diff
│   │   └── services/
│   │       ├── parser.py         # Multi-format parsing (PDF, DOCX, CSV, TXT)
│   │       ├── rag_engine.py     # Chunking, BM25 ranking, and citation indexer
│   │       ├── gemini_service.py # Google GenAI SDK (gemini-3.8-flash) & fallback
│   │       └── demo_data.py      # Pre-indexed enterprise datasets for sandbox
│   ├── test_api.py               # Automated test suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx               # Top navigation & status indicators
│   │   │   ├── DocumentSidebar.tsx      # Document workspace drawer
│   │   │   ├── DocumentViewer.tsx       # Document canvas with citation locator
│   │   │   ├── ChatPanel.tsx            # Streaming conversation with citations
│   │   │   ├── ExecutiveSummaryView.tsx # Executive brief & action items
│   │   │   ├── SmartExtractionView.tsx  # Relational entities & CSV export
│   │   │   ├── DocumentCompareView.tsx  # Side-by-side contract diff view
│   │   │   ├── DocumentUploadModal.tsx  # Drag & drop file upload modal
│   │   │   └── SettingsModal.tsx        # Gemini API Key & model manager
│   │   ├── services/
│   │   │   └── api.ts                   # Fetch & SSE stream consumer
│   │   ├── types/                       # TypeScript models
│   │   ├── App.tsx                      # Main workspace container
│   │   └── index.css                    # Tailwind CSS v4 styling
│   └── package.json
├── run.bat                              # One-click Windows batch launcher
├── start.ps1                            # PowerShell launcher
└── README.md
```
