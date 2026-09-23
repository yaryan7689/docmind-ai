# DocuMind AI PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "              DocuMind AI Platform Launcher             " -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "  Multimodal Document Intelligence & Assistant Platform " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "`n[1/3] Starting FastAPI Backend on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\backend'; .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "[2/3] Starting Vite Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\frontend'; npm run dev"

Write-Host "[3/3] Opening browser at http://localhost:5173..." -ForegroundColor Green
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "DocuMind AI is now running!" -ForegroundColor Green
Write-Host "Frontend:        http://localhost:5173" -ForegroundColor White
Write-Host "API Swagger:     http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "========================================================`n" -ForegroundColor Green
