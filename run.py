"""
DocuMind AI - Unified Development Runner for VS Code & Terminal
Runs both the FastAPI backend and Vite frontend concurrently in a single terminal.
"""
import os
import sys
import subprocess
import threading
import time
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

# Locate the virtualenv python
VENV_PYTHON = BACKEND_DIR / ".venv" / "Scripts" / "python.exe"
if not VENV_PYTHON.exists():
    python_executable = Path(sys.executable)
else:
    python_executable = VENV_PYTHON

def stream_output(
    proc: subprocess.Popen[str], prefix: str, color_code: str
) -> None:
    """Stream stdout/stderr from a subprocess with a colored tag."""
    reset = "\033[0m"
    tag = f"{color_code}[{prefix}]{reset} "
    stdout = proc.stdout
    if stdout is None:
        return
    try:
        for line in iter(stdout.readline, ''):
            if not line:
                break
            print(f"{tag}{line.rstrip()}", flush=True)
    except Exception:
        pass

def main():
    print("\033[1;36m" + "=" * 60)
    print("           DocuMind AI - All-in-One Launcher           ")
    print("=" * 60 + "\033[0m")
    print(f"[*] Project root: {ROOT_DIR}")
    print(f"[*] Python interpreter: {python_executable}")

    # 1. Start backend process
    print("\n\033[1;33m[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...\033[0m")
    backend_cmd = [
        str(python_executable),
        "-m", "uvicorn",
        "app.main:app",
        "--host", "127.0.0.1",
        "--port", "8000",
        "--reload"
    ]
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=str(BACKEND_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        encoding='utf-8',
        errors='replace'
    )

    t_backend = threading.Thread(
        target=stream_output,
        args=(backend_proc, "Backend", "\033[1;34m"),
        daemon=True
    )
    t_backend.start()

    # Wait for backend to initialize
    time.sleep(2)

    # 2. Start frontend process
    print("\033[1;32m[2/2] Starting Vite Frontend on http://localhost:5173 ...\033[0m")
    # Use npm.cmd on Windows
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=str(FRONTEND_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        encoding='utf-8',
        errors='replace'
    )

    t_frontend = threading.Thread(
        target=stream_output,
        args=(frontend_proc, "Frontend", "\033[1;32m"),
        daemon=True
    )
    t_frontend.start()

    # Wait a bit then open browser
    time.sleep(2)
    print("\n\033[1;35m[*] DocuMind AI is active! Press Ctrl+C in this terminal to stop both servers.\033[0m")
    print("\033[1;37m    -> Frontend: http://localhost:5173\033[0m")
    print("\033[1;37m    -> Backend API: http://127.0.0.1:8000/docs\033[0m\n")

    try:
        webbrowser.open("http://localhost:5173")
    except Exception:
        pass

    try:
        while True:
            # Check if either crashed
            if backend_proc.poll() is not None:
                print("\033[1;31m[!] Backend process stopped unexpectedly.\033[0m")
                break
            if frontend_proc.poll() is not None:
                print("\033[1;31m[!] Frontend process stopped unexpectedly.\033[0m")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\033[1;33m[*] Stopping DocuMind AI servers...\033[0m")
    finally:
        try:
            backend_proc.terminate()
            backend_proc.wait(timeout=3)
        except Exception:
            backend_proc.kill()
        try:
            frontend_proc.terminate()
            frontend_proc.wait(timeout=3)
        except Exception:
            frontend_proc.kill()
        print("\033[1;32m[*] Both servers stopped cleanly.\033[0m")

if __name__ == "__main__":
    main()
