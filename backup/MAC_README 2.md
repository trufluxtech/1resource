# Truflux Resource Bank Portal v1.0.6 - Mac / Python 3.13 Fixed

This build fixes the Python 3.13 `pydantic-core` install error by using Python 3.13-compatible dependency versions.

## Recommended Mac startup

```bash
cd truflux_resume_portal_v1_0_6_py313_fixed
python3 start_dev.py
```

If you previously ran an older build and the install failed, clean the old virtual environment first:

```bash
rm -rf backend/.venv
python3 start_dev.py
```

Or use:

```bash
./clean_start_mac.sh
```

## Default login

```text
Admin / admin123
```

## Open the app

```text
http://localhost:5173
```

## What changed in v1.0.6

- Fixed Python 3.13 `pydantic-core` build failure.
- Upgraded backend dependency pins to Python 3.13-compatible versions.
- Removed `uvicorn[standard]` to avoid unnecessary compiled dependency issues on Mac.
- Added `--prefer-binary` during backend dependency installation.
- Added `clean_start_mac.sh` and `clean_start_mac.command`.
