@echo off
setlocal enabledelayedexpansion
title DocuMind AI Launcher
echo ========================================================
echo               DocuMind AI Platform Launcher
echo   Multimodal Document Intelligence (Groq / OpenAI / Gemini)
echo ========================================================
echo.

set "ROOT=%~dp0"
cd /d "%ROOT%"

rem Verify Python venv
if not exist "%ROOT%backend\.venv\Scripts\python.exe" (
    echo [Setup] Creating Python virtual environment...
    python -m venv "%ROOT%backend\.venv"
    echo [Setup] Installing backend dependencies...
    "%ROOT%backend\.venv\Scripts\pip.exe" install -r "%ROOT%backend\requirements.txt"
)

rem Verify Frontend node_modules
if not exist "%ROOT%frontend\node_modules" (
    echo [Setup] Installing frontend dependencies...
    cd /d "%ROOT%frontend"
    call npm install
    cd /d "%ROOT%"
)

echo [1/3] Starting FastAPI Backend on port 8000...
start "DocuMind Backend (FastAPI)" cmd /k "cd /d ""%ROOT%backend"" && "".venv\Scripts\python.exe"" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/3] Starting Vite Frontend on port 5173...
start "DocuMind Frontend (Vite)" cmd /k "cd /d ""%ROOT%frontend"" && npm run dev"

echo [3/3] Opening DocuMind AI in default browser...
timeout /t 4 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================================
echo DocuMind AI is active!
echo Frontend: http://localhost:5173
echo Backend API: http://127.0.0.1:8000/docs
echo Providers supported: Groq, OpenAI, Gemini, Demo Sandbox
echo ========================================================
echo.
pause
