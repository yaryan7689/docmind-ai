import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root or backend folder
backend_dir = Path(__file__).resolve().parent.parent
project_dir = backend_dir.parent
load_dotenv(backend_dir / ".env")
load_dotenv(project_dir / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""

# Auto-detect default provider based on available keys
if OPENAI_API_KEY:
    DEFAULT_PROVIDER = "openai"
    DEFAULT_MODEL = "gpt-4o-mini"
elif GROQ_API_KEY:
    DEFAULT_PROVIDER = "groq"
    DEFAULT_MODEL = "llama-3.3-70b-versatile"
elif GEMINI_API_KEY:
    DEFAULT_PROVIDER = "gemini"
    DEFAULT_MODEL = "gemini-3.8-flash"
else:
    DEFAULT_PROVIDER = "demo"
    DEFAULT_MODEL = "demo-local"

STORAGE_DIR = backend_dir / "storage"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR = STORAGE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
