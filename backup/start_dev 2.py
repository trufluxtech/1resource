"""Reliable local launcher for Truflux Resource Bank.

Starts the Python FastAPI backend and the React/Vite frontend together.
Works on Windows, macOS, and Linux.
"""
import os
import shutil
import socket
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"
IS_WINDOWS = os.name == "nt"


def find_python() -> str:
    candidates = [sys.executable]
    candidates += ["py", "python", "python3"] if IS_WINDOWS else ["python3", "python"]
    for cmd in candidates:
        try:
            r = subprocess.run([cmd, "--version"], capture_output=True, text=True, check=False)
            if r.returncode == 0 and "Python" in (r.stdout + r.stderr):
                return cmd
        except Exception:
            pass
    raise RuntimeError("Python 3 was not found. Please install Python 3.10 or above and try again.")


def find_free_port(preferred: int) -> int:
    def is_free(port: int) -> bool:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(0.25)
            return sock.connect_ex(("127.0.0.1", port)) != 0
    if is_free(preferred):
        return preferred
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def npm_cmd() -> str:
    cmd = shutil.which("npm.cmd") if IS_WINDOWS else None
    cmd = cmd or shutil.which("npm")
    if not cmd:
        raise RuntimeError("npm was not found. Please install Node.js 18+ LTS and reopen the terminal.")
    return cmd


def check_node() -> str:
    if not shutil.which("node"):
        raise RuntimeError("Node.js was not found. Please install Node.js 18+ LTS and reopen the terminal.")
    npm = npm_cmd()
    try:
        r = subprocess.run(["node", "-v"], capture_output=True, text=True, check=False)
        print(f"Node detected: {r.stdout.strip() or r.stderr.strip()}", flush=True)
    except Exception:
        pass
    return npm


def run_checked(cmd, cwd: Path, label: str, env=None) -> None:
    print(f"\n--- {label} ---", flush=True)
    print(" ".join(str(x) for x in cmd), flush=True)
    subprocess.check_call(cmd, cwd=str(cwd), shell=False, env=env)


def ensure_backend_venv() -> Path:
    if not BACKEND.exists():
        raise RuntimeError(f"Backend folder not found: {BACKEND}")
    py_cmd = find_python()
    venv = BACKEND / ".venv"
    python_in_venv = venv / ("Scripts/python.exe" if IS_WINDOWS else "bin/python")
    pip_in_venv = venv / ("Scripts/pip.exe" if IS_WINDOWS else "bin/pip")

    if not python_in_venv.exists():
        run_checked([py_cmd, "-m", "venv", str(venv)], BACKEND, "Creating Python virtual environment")

    run_checked([str(python_in_venv), "-m", "pip", "install", "--upgrade", "pip"], BACKEND, "Updating pip")
    run_checked([str(pip_in_venv), "install", "-r", "requirements.txt"], BACKEND, "Installing backend dependencies")
    return python_in_venv


def install_frontend() -> str:
    if not FRONTEND.exists():
        raise RuntimeError(f"Frontend folder not found: {FRONTEND}")
    npm = check_node()
    run_checked([npm, "install"], FRONTEND, "Installing frontend dependencies")
    return npm


def start_process(cmd, cwd: Path, label: str, env=None):
    print(f"\nStarting {label}:", " ".join(str(x) for x in cmd), flush=True)
    creationflags = subprocess.CREATE_NEW_PROCESS_GROUP if IS_WINDOWS else 0
    return subprocess.Popen(cmd, cwd=str(cwd), shell=False, creationflags=creationflags, env=env)


def main() -> int:
    print("Truflux Resource Bank Portal v1.0.2")
    print(f"Project folder: {ROOT}")

    backend_port = int(os.environ.get("BACKEND_PORT") or find_free_port(8000))
    frontend_port = int(os.environ.get("FRONTEND_PORT") or find_free_port(5173))

    if backend_port != 8000:
        print(f"Port 8000 is busy. Backend will use {backend_port}.")
    if frontend_port != 5173:
        print(f"Port 5173 is busy. Frontend will use {frontend_port}.")

    try:
        backend_python = ensure_backend_venv()
        npm = install_frontend()
    except Exception as exc:
        print(f"\nStartup preparation failed: {exc}")
        print("\nCommon fixes:")
        print("1. Install Python 3.10+ and ensure it is in PATH. On Mac, try: python3 --version")
        print("2. Install Node.js 18+ LTS and ensure node/npm are in PATH. Try: node -v && npm -v")
        print("3. Run this script from the extracted project folder, not from inside the ZIP file.")
        print("4. If macOS blocks the command file, run: chmod +x start_mac.command")
        return 1

    backend_env = os.environ.copy()
    backend_env["PYTHONUNBUFFERED"] = "1"

    frontend_env = os.environ.copy()
    frontend_env["VITE_API_BASE"] = f"http://localhost:{backend_port}"

    backend = start_process(
        [str(backend_python), "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", str(backend_port)],
        BACKEND,
        f"backend on http://localhost:{backend_port}",
        env=backend_env,
    )

    time.sleep(2)
    if backend.poll() is not None:
        print("\nBackend failed to start. Check the error above.")
        return 1

    frontend = start_process(
        [npm, "run", "dev", "--", "--host", "0.0.0.0", "--port", str(frontend_port), "--strictPort"],
        FRONTEND,
        f"frontend on http://localhost:{frontend_port}",
        env=frontend_env,
    )

    print(f"\nOpen: http://localhost:{frontend_port}")
    print(f"Backend health: http://localhost:{backend_port}/api/health")
    print("Default login: Admin / admin123")
    print("Press Ctrl+C to stop both services.\n")

    try:
        while True:
            time.sleep(1)
            if backend.poll() is not None:
                print("Backend stopped. Check the error above.")
                break
            if frontend.poll() is not None:
                print("Frontend stopped. Check the error above.")
                break
    except KeyboardInterrupt:
        print("\nStopping services...")
    finally:
        for proc in (locals().get("frontend"), backend):
            if proc and proc.poll() is None:
                proc.terminate()
        time.sleep(1)
        for proc in (locals().get("frontend"), backend):
            if proc and proc.poll() is None:
                proc.kill()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
