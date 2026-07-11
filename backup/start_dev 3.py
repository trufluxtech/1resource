"""Robust local launcher for Truflux Resource Bank.

Starts the FastAPI backend and Vite frontend together.
Works on Windows, macOS and Linux.
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


def find_free_port(preferred: int) -> int:
    """Return preferred port if free, otherwise return an available port."""
    def is_free(port: int) -> bool:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(0.5)
            return sock.connect_ex(("127.0.0.1", port)) != 0

    if is_free(preferred):
        return preferred
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def die(message: str, code: int = 1) -> None:
    print("\nERROR:", message)
    print("\nChecklist:")
    print("1. Install Python 3.11, 3.12, or 3.13 and ensure it is available in PATH.")
    print("2. Install Node.js LTS from https://nodejs.org and reopen the terminal.")
    print("3. Run this command from the project root: python start_dev.py")
    sys.exit(code)


def run_checked(cmd, cwd=None, env=None, timeout=None):
    print("\n> " + " ".join(str(x) for x in cmd))
    try:
        subprocess.check_call(cmd, cwd=str(cwd) if cwd else None, env=env, timeout=timeout)
    except subprocess.TimeoutExpired:
        raise RuntimeError("Command timed out. Check your internet connection or run the manual install commands in MAC_README.md.")


def ensure_backend_venv() -> Path:
    if not BACKEND.exists():
        die(f"Backend folder not found: {BACKEND}")

    venv = BACKEND / ".venv"
    py = venv / ("Scripts/python.exe" if IS_WINDOWS else "bin/python")

    if not py.exists():
        print("Creating backend virtual environment...")
        run_checked([sys.executable, "-m", "venv", str(venv)])

    print("Installing backend dependencies...")
    run_checked([str(py), "-m", "pip", "install", "--upgrade", "pip", "setuptools", "wheel"], cwd=BACKEND)

    # Python 3.13 needs newer Pydantic / pydantic-core wheels. --prefer-binary prevents
    # pip from trying to compile Rust packages locally when a compatible wheel exists.
    try:
        run_checked([str(py), "-m", "pip", "install", "--prefer-binary", "-r", "requirements.txt"], cwd=BACKEND)
    except Exception as exc:
        print("\nBackend dependency installation failed.")
        print("This is usually caused by an old virtual environment or an old pydantic-core build cache.")
        print("Run this from the project root and try again:")
        print("  rm -rf backend/.venv")
        print("  python3 start_dev.py")
        raise
    return py


def ensure_frontend_ready() -> str:
    if not FRONTEND.exists():
        die(f"Frontend folder not found: {FRONTEND}")

    npm = shutil.which("npm.cmd") or shutil.which("npm")
    if not npm:
        die("Node.js/npm was not found. Please install Node.js LTS and reopen the terminal.")

    lock_file = FRONTEND / "package-lock.json"
    if lock_file.exists():
        try:
            lock_text = lock_file.read_text(errors="ignore")
            if "applied-caas-gateway" in lock_text or "artifactory" in lock_text:
                print("Removing environment-specific package-lock.json...")
                lock_file.unlink()
        except Exception:
            pass

    node_modules = FRONTEND / "node_modules"
    vite_bin = node_modules / (".bin/vite.cmd" if IS_WINDOWS else ".bin/vite")

    npm_env = os.environ.copy()
    npm_env["npm_config_registry"] = "https://registry.npmjs.org/"
    npm_env["npm_config_progress"] = "false"
    npm_env["npm_config_audit"] = "false"
    npm_env["npm_config_fund"] = "false"
    npm_env["npm_config_loglevel"] = "warn"

    if vite_bin.exists():
        print("Frontend dependencies already installed. Skipping npm install.")
    else:
        print("Installing frontend dependencies from public npm registry...")
        try:
            run_checked([npm, "install", "--no-audit", "--no-fund", "--progress=false"], cwd=FRONTEND, env=npm_env, timeout=300)
        except Exception as exc:
            die(f"Frontend dependency installation failed: {exc}")
    return npm


def start_process(cmd, cwd=None, env=None):
    print("\nStarting: " + " ".join(str(x) for x in cmd))
    return subprocess.Popen(cmd, cwd=str(cwd) if cwd else None, env=env)


def main():
    print("Truflux Resource Bank v1.0.6 - Local Startup")
    print(f"Project root: {ROOT}")

    backend_port = int(os.environ.get("BACKEND_PORT", find_free_port(8000)))
    frontend_port = int(os.environ.get("FRONTEND_PORT", find_free_port(5173)))

    backend_python = ensure_backend_venv()
    npm = ensure_frontend_ready()

    backend_env = os.environ.copy()
    backend_env["PYTHONUNBUFFERED"] = "1"

    frontend_env = os.environ.copy()
    frontend_env["VITE_API_BASE"] = f"http://localhost:{backend_port}"

    backend = start_process(
        [
            str(backend_python),
            "-m",
            "uvicorn",
            "main:app",
            "--host",
            "0.0.0.0",
            "--port",
            str(backend_port),
        ],
        cwd=BACKEND,
        env=backend_env,
    )

    time.sleep(2)
    if backend.poll() is not None:
        die("Backend failed to start. Check the error message above.")

    frontend = start_process(
        [npm, "run", "dev", "--", "--host", "0.0.0.0", "--port", str(frontend_port)],
        cwd=FRONTEND,
        env=frontend_env,
    )

    print("\nApplication started successfully.")
    print(f"Backend health: http://localhost:{backend_port}/api/health")
    print(f"Frontend:       http://localhost:{frontend_port}")
    print("\nDefault login: Admin / admin123")
    print("Press Ctrl+C to stop both servers.\n")

    try:
        while True:
            time.sleep(1)
            if backend.poll() is not None:
                print("Backend stopped unexpectedly.")
                break
            if frontend.poll() is not None:
                print("Frontend stopped unexpectedly.")
                break
    except KeyboardInterrupt:
        print("\nStopping servers...")
    finally:
        for proc in (frontend, backend):
            if proc and proc.poll() is None:
                proc.terminate()
        time.sleep(1)
        for proc in (frontend, backend):
            if proc and proc.poll() is None:
                proc.kill()
        print("Stopped.")


if __name__ == "__main__":
    main()
