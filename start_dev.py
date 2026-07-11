"""Robust local launcher for 1Resource.

Starts the FastAPI backend and Vite frontend together.
Works on Windows, macOS and Linux.

v1.0.12 Mac venv fix:
- Handles broken Framework Python 3.13 ensurepip installations.
- Lets user force a Python executable using TRUFLUX_PYTHON.
- Prefers Homebrew Python 3.12/3.11 on macOS when available.
- Gives clear repair instructions instead of an unreadable traceback.
"""
import os
import shutil
import socket
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"
IS_WINDOWS = os.name == "nt"
IS_MAC = sys.platform == "darwin"


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
    print("1. Install Node.js LTS and reopen the terminal.")
    print("2. On Mac, prefer Homebrew Python 3.12 if Framework Python 3.13 has ensurepip issues:")
    print("   brew install python@3.12")
    print("3. Then run:")
    print("   TRUFLUX_PYTHON=/opt/homebrew/bin/python3.12 python3 start_dev.py")
    print("4. Or run the clean helper:")
    print("   ./clean_start_mac.sh")
    sys.exit(code)


def run_checked(cmd, cwd=None, env=None, timeout=None):
    print("\n> " + " ".join(str(x) for x in cmd))
    try:
        subprocess.check_call(cmd, cwd=str(cwd) if cwd else None, env=env, timeout=timeout)
    except subprocess.TimeoutExpired:
        raise RuntimeError("Command timed out. Check your internet connection or run the manual install commands in MAC_README.md.")


def clean_pip_env() -> dict:
    """Return an environment that does not point pip/requests to a stale certificate file."""
    env = os.environ.copy()
    for key in [
        "SSL_CERT_FILE",
        "REQUESTS_CA_BUNDLE",
        "CURL_CA_BUNDLE",
        "PIP_CERT",
        "PIP_CONFIG_FILE",
    ]:
        if env.get(key):
            print(f"Clearing stale certificate/config environment variable: {key}")
            env.pop(key, None)
    env["PIP_DISABLE_PIP_VERSION_CHECK"] = "1"
    env["PYTHONHTTPSVERIFY"] = "1"
    return env


def pip_run(py: Path, args: list, cwd: Path, timeout=None):
    """Run pip with a clean certificate environment."""
    return run_checked([str(py), "-m", "pip", *args], cwd=cwd, env=clean_pip_env(), timeout=timeout)


def executable_exists(path: str) -> bool:
    return bool(path and Path(path).exists() and os.access(path, os.X_OK))


def python_version(py_exe: str) -> tuple:
    try:
        out = subprocess.check_output(
            [py_exe, "-c", "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}')"],
            text=True,
            stderr=subprocess.DEVNULL,
            timeout=10,
        ).strip()
        major, minor, patch = out.split(".")[:3]
        return int(major), int(minor), int(patch)
    except Exception:
        return (0, 0, 0)


def candidate_python_executables() -> list:
    """Return candidate Python executables, putting Homebrew 3.12/3.11 before Framework 3.13 on macOS."""
    candidates = []

    forced = os.environ.get("TRUFLUX_PYTHON") or os.environ.get("TF_PYTHON")
    if forced:
        candidates.append(forced)

    if IS_MAC:
        candidates.extend([
            "/opt/homebrew/bin/python3.12",
            "/opt/homebrew/bin/python3.11",
            "/usr/local/bin/python3.12",
            "/usr/local/bin/python3.11",
            "/opt/homebrew/bin/python3",
            "/usr/local/bin/python3",
        ])

    candidates.extend([
        sys.executable,
        shutil.which("python3.12"),
        shutil.which("python3.11"),
        shutil.which("python3"),
        shutil.which("python"),
    ])

    unique = []
    seen = set()
    for item in candidates:
        if not item:
            continue
        resolved = str(Path(item))
        if resolved in seen:
            continue
        seen.add(resolved)
        if executable_exists(resolved):
            version = python_version(resolved)
            if version >= (3, 11, 0):
                unique.append(resolved)
    return unique


def create_venv_with_fallback(venv: Path) -> Path:
    """Create backend/.venv using the first Python that can run venv+ensurepip."""
    errors = []
    for py_exe in candidate_python_executables():
        version = python_version(py_exe)
        print(f"Trying Python {version[0]}.{version[1]}.{version[2]}: {py_exe}")
        if venv.exists():
            shutil.rmtree(venv, ignore_errors=True)
        try:
            run_checked([py_exe, "-m", "venv", str(venv)])
            py = venv / ("Scripts/python.exe" if IS_WINDOWS else "bin/python")
            if py.exists():
                # Confirm pip is present. This is the step that fails when ensurepip is broken.
                pip_run(py, ["--version"], cwd=BACKEND)
                return py
        except Exception as exc:
            errors.append(f"{py_exe}: {exc}")
            print("This Python could not create a working virtual environment. Trying another Python if available...")

    print("\nCould not create backend virtual environment with any detected Python.")
    print("\nAttempts:")
    for err in errors:
        print("-", err)
    print("\nRecommended Mac fix:")
    print("  brew install python@3.12")
    print("  cd " + str(ROOT))
    print("  rm -rf backend/.venv")
    print("  TRUFLUX_PYTHON=/opt/homebrew/bin/python3.12 python3 start_dev.py")
    die("Python venv creation failed because pip/ensurepip is not working in the detected Python installation.")


def ensure_backend_venv() -> Path:
    if not BACKEND.exists():
        die(f"Backend folder not found: {BACKEND}")

    venv = BACKEND / ".venv"
    py = venv / ("Scripts/python.exe" if IS_WINDOWS else "bin/python")

    if not py.exists():
        print("Creating backend virtual environment...")
        py = create_venv_with_fallback(venv)
    else:
        print("Backend virtual environment already exists.")
        try:
            pip_run(py, ["--version"], cwd=BACKEND)
        except Exception:
            print("Existing virtual environment is broken. Recreating it...")
            shutil.rmtree(venv, ignore_errors=True)
            py = create_venv_with_fallback(venv)

    print("Installing backend dependencies...")

    def reinstall_venv(reason: str) -> Path:
        print("\nPython virtual environment repair triggered.")
        print(reason)
        print("Removing backend/.venv and recreating it with a clean certificate environment...")
        shutil.rmtree(venv, ignore_errors=True)
        repaired_py = create_venv_with_fallback(venv)
        return repaired_py

    try:
        pip_run(py, ["install", "--upgrade", "pip", "setuptools", "wheel"], cwd=BACKEND, timeout=300)
    except Exception as exc:
        message = str(exc)
        py = reinstall_venv(f"pip upgrade failed, likely due to stale certifi/cacert path: {message}")
        pip_run(py, ["install", "--upgrade", "pip", "setuptools", "wheel"], cwd=BACKEND, timeout=300)

    try:
        pip_run(py, ["install", "--prefer-binary", "-r", "requirements.txt"], cwd=BACKEND, timeout=300)
    except Exception as exc:
        message = str(exc)
        if "certifi" in message.lower() or "certificate" in message.lower() or "cacert" in message.lower():
            py = reinstall_venv(f"Dependency install failed due to certificate bundle issue: {message}")
            pip_run(py, ["install", "--upgrade", "pip", "setuptools", "wheel"], cwd=BACKEND, timeout=300)
            pip_run(py, ["install", "--prefer-binary", "-r", "requirements.txt"], cwd=BACKEND, timeout=300)
        else:
            print("\nBackend dependency installation failed.")
            print("Run this from the project root and try again:")
            print("  rm -rf backend/.venv")
            print("  unset SSL_CERT_FILE REQUESTS_CA_BUNDLE CURL_CA_BUNDLE PIP_CERT PIP_CONFIG_FILE")
            print("  TRUFLUX_PYTHON=/opt/homebrew/bin/python3.12 python3 start_dev.py")
            raise
    return py


def ensure_frontend_ready() -> str:
    if not FRONTEND.exists():
        die(f"Frontend folder not found: {FRONTEND}")

    npm = shutil.which("npm.cmd") or shutil.which("npm")
    node = shutil.which("node.exe") or shutil.which("node")
    if not npm:
        die("Node.js/npm was not found. Please install Node.js LTS and reopen the terminal.")
    if not node:
        die("Node.js was not found. Please install Node.js LTS and reopen the terminal.")

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
    vite_cache = node_modules / ".vite"

    npm_env = os.environ.copy()
    npm_env["npm_config_registry"] = "https://registry.npmjs.org/"
    npm_env["npm_config_progress"] = "false"
    npm_env["npm_config_audit"] = "false"
    npm_env["npm_config_fund"] = "false"
    npm_env["npm_config_loglevel"] = "warn"
    npm_env["npm_config_fetch_timeout"] = "60000"
    npm_env["npm_config_fetch_retries"] = "2"
    npm_env["npm_config_fetch_retry_maxtimeout"] = "30000"

    # Do not delete node_modules during normal startup. Only clear Vite optimizer cache.
    if vite_cache.exists():
        print("Clearing Vite optimizer cache...")
        shutil.rmtree(vite_cache, ignore_errors=True)

    def vite_ok() -> bool:
        if not vite_bin.exists():
            return False
        try:
            subprocess.check_call(
                [node, "-e", "import('vite').then(()=>process.exit(0)).catch(()=>process.exit(1))"],
                cwd=str(FRONTEND),
                env=npm_env,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                timeout=20,
            )
            return True
        except Exception:
            return False

    if vite_ok():
        print("Frontend dependencies verified. Skipping npm install.")
    else:
        if os.environ.get("SKIP_NPM_INSTALL") == "1":
            die("Frontend dependencies are missing or broken, and SKIP_NPM_INSTALL=1 was set. Run ./repair_frontend_mac.sh once, then start again.")

        print("Frontend dependencies are missing or broken.")
        print("Checking npm registry connectivity before installing...")
        try:
            run_checked([npm, "ping", "--registry", "https://registry.npmjs.org/"], cwd=FRONTEND, env=npm_env, timeout=30)
        except Exception as exc:
            print("\nNPM registry check failed or timed out.")
            print("This usually means network/proxy/DNS is blocking npm.")
            print("Try this once in a separate terminal:")
            print("  cd " + str(FRONTEND))
            print("  npm config set registry https://registry.npmjs.org/")
            print("  npm install --no-audit --no-fund --progress=false --loglevel=verbose")
            raise

        print("Installing frontend dependencies. First run may take a few minutes; future starts will skip this.")
        try:
            run_checked([npm, "install", "--no-audit", "--no-fund", "--progress=false", "--loglevel=warn"], cwd=FRONTEND, env=npm_env, timeout=180)
        except Exception as exc:
            print("\nFrontend dependency installation did not complete.")
            print("Most likely reasons: slow network, proxy blocking npm, or npm cache issue.")
            print("Run this once:")
            print("  cd " + str(ROOT))
            print("  ./repair_frontend_mac.sh")
            print("Then start normally:")
            print("  ./start_mac.sh")
            raise

        if not vite_ok():
            die("npm install completed but Vite still cannot be imported. Run ./repair_frontend_mac.sh and paste the full output if it fails.")

    # Always remove Vite's pre-bundled dependency cache before launching dev server.
    shutil.rmtree(FRONTEND / "node_modules" / ".vite", ignore_errors=True)
    shutil.rmtree(FRONTEND / ".vite", ignore_errors=True)
    return npm


def start_process(cmd, cwd=None, env=None):
    print("\nStarting: " + " ".join(str(x) for x in cmd))
    return subprocess.Popen(cmd, cwd=str(cwd) if cwd else None, env=env)



def wait_for_backend_health(port: int, seconds: int = 20) -> bool:
    url = f"http://127.0.0.1:{port}/api/health"
    deadline = time.time() + seconds
    last_error = ""
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=2) as response:
                if response.status == 200:
                    return True
        except Exception as exc:
            last_error = str(exc)
        time.sleep(0.75)
    print(f"Backend health check failed at {url}: {last_error}")
    return False


def main():
    print("1Resource Production 1.15 - Local/PostgreSQL Startup")
    print(f"Project root: {ROOT}")

    backend_port = int(os.environ.get("BACKEND_PORT", find_free_port(8000)))
    frontend_port = int(os.environ.get("FRONTEND_PORT", find_free_port(5173)))

    backend_python = ensure_backend_venv()
    npm = ensure_frontend_ready()

    backend_env = os.environ.copy()
    backend_env["PYTHONUNBUFFERED"] = "1"

    frontend_env = os.environ.copy()
    # Prefer relative /api calls in local dev. Vite proxies /api to the backend.
    # This avoids browser CORS and "Failed to fetch" issues when using localhost vs network URLs.
    frontend_env.pop("VITE_API_BASE", None)
    frontend_env["BACKEND_PROXY_TARGET"] = f"http://127.0.0.1:{backend_port}"
    frontend_env["VITE_BACKEND_PROXY_TARGET"] = f"http://127.0.0.1:{backend_port}"
    frontend_env["FRONTEND_PORT"] = str(frontend_port)

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

    if backend.poll() is not None:
        die("Backend failed to start. Check the error message above.")
    if not wait_for_backend_health(backend_port):
        if backend.poll() is not None:
            die("Backend stopped before health check completed. Check the error message above.")
        die("Backend started but /api/health did not respond. Check whether another process is blocking the port.")

    frontend = start_process(
        [npm, "run", "dev", "--", "--host", "0.0.0.0", "--port", str(frontend_port)],
        cwd=FRONTEND,
        env=frontend_env,
    )

    print("\nApplication started successfully.")
    print(f"Backend health: http://127.0.0.1:{backend_port}/api/health")
    print(f"Frontend:       http://localhost:{frontend_port}")
    print(f"Login API:      http://localhost:{frontend_port}/api/login -> proxy to backend")
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
