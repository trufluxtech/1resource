# Mac Run Guide — 1Resource v1.0.23

## Start

```bash
cd truflux_resume_portal_v1.0.23_mac_venv_fix
python3 start_dev.py
```

Then open:

```text
http://localhost:5173
```

Default login:

```text
Admin / admin123
```

## Clean start

Use this if Python or npm dependencies get stuck:

```bash
cd truflux_resume_portal_v1.0.23_mac_venv_fix
./clean_start_mac.sh
```

## Manual backend reset

```bash
cd truflux_resume_portal_v1.0.23_mac_venv_fix
rm -rf backend/.venv
python3 start_dev.py
```

## Manual frontend reset

```bash
cd truflux_resume_portal_v1.0.23_mac_venv_fix/frontend
rm -rf node_modules package-lock.json
npm config set registry https://registry.npmjs.org/
npm install --no-audit --no-fund --progress=false
cd ..
python3 start_dev.py
```

## Security defaults

- Sessions expire after 8 hours by default.
- Resume uploads are limited to 10 MB by default.
- Allowed resume formats: PDF, DOCX, TXT, MD.
- Public upload links expire after 48 hours and can be revoked.
- Reused public links cannot create a second candidate.
- Admins can view the Security Centre from the left menu.

For deployed environments, set `ALLOWED_ORIGINS` to the actual application URL.


## v1.0.23 Admin Password Control

- Admin can reset/change password for any user from Admin > User Management.
- Reset clears that user's active sessions.
- Admin can choose whether the user must change password on next login.
- Existing passwords are never displayed to Admin.


## v1.0.23 Demand Link Notes

When creating a public upload link, recruiters can optionally select a demand record. The link will use that demand for resume scoring and will automatically create/update the shortlist entry after upload.


## v1.0.23 Mac Virtual Environment Fix

This release improves startup on Macs where `/Library/Frameworks/Python.framework/Versions/3.13/bin/python3 -m venv` fails during `ensurepip`.

Recommended clean start:

```bash
cd truflux_resume_portal_v1.0.23_mac_venv_fix
./clean_start_mac.sh
```

If the same error appears, install Homebrew Python 3.12 and force the launcher to use it:

```bash
brew install python@3.12
cd truflux_resume_portal_v1.0.23_mac_venv_fix
rm -rf backend/.venv
TRUFLUX_PYTHON=/opt/homebrew/bin/python3.12 python3 start_dev.py
```

The app still includes all v1.0.23 features: demand-linked public upload links, admin password control, security hardening, demand-side module, resume intelligence, and availability fields.


## v1.0.23 updates
- Demand records now generate 10 skill-based MCQs on the fly.
- Demand-linked public upload links require candidates to complete MCQs before resume upload.
- MCQ score is stored with the public resume upload and shortlist note.
- Create 50 test data button moved from Dashboard to Admin > User Management.


## v1.0.23 Created Date Trends

- Added explicit `created_date` to candidate/supply records.
- Added explicit `created_date` to demand records.
- Existing records are automatically backfilled from `created_at`.
- Demand trend now uses `created_date` first, with `created_at` as fallback.
- Supply trend now uses `created_date` first, with `created_at` as fallback.


## v1.0.23 Startup Fix

- Cleaned `start_dev.py` so it contains Python code only.
- Retained v1.0.23 created_date trend changes.
- Demand and supply trends continue to use `created_date` first and `created_at` as fallback.


## v1.0.23 Demo Data Button Fix

- Fixed the demo-data backend insert after adding `created_date`.
- Create Demo Data now correctly creates 50 candidates and 8 demand records.
- Intelligence trends refresh after demo data is created.


## v1.0.23 Fake Risk RAG

- Added Green / Amber / Red RAG status for fake-resume risk.
- Resume Bank now shows RAG beside the fake-risk score.
- Candidate detail now shows a Fake Risk RAG card.
- API now enriches candidate records with `fake_risk_rag`, `fake_risk_rag_label`, and `fake_risk_rag_action`.


## v1.0.23 Vite Cache Fix

- Fixed recurring Vite missing `dep-*.js` chunk errors caused by stale or partially installed `node_modules`.
- `start_dev.py` now verifies Vite before startup and reinstalls frontend dependencies if corrupted.
- `clean_start_mac.sh` now removes Vite optimizer cache and npm lock artifacts.
- Added `repair_frontend_mac.sh` for quick frontend-only repair.


## v1.0.23 Login Fetch Fix

- Fixed login `Failed to fetch` caused by frontend/backend URL mismatch.
- Vite now proxies local `/api` calls to the actual backend port selected by the launcher.
- `start_dev.py` waits for `/api/health` before starting the frontend.
- Backend allows local network browser origins as a fallback.
