# Mac Run Guide — 1Resource v1.0.28

## Start

```bash
cd truflux_resume_portal_v1.0.28_mac_venv_fix
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
cd truflux_resume_portal_v1.0.28_mac_venv_fix
./clean_start_mac.sh
```

## Manual backend reset

```bash
cd truflux_resume_portal_v1.0.28_mac_venv_fix
rm -rf backend/.venv
python3 start_dev.py
```

## Manual frontend reset

```bash
cd truflux_resume_portal_v1.0.28_mac_venv_fix/frontend
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


## v1.0.28 Admin Password Control

- Admin can reset/change password for any user from Admin > User Management.
- Reset clears that user's active sessions.
- Admin can choose whether the user must change password on next login.
- Existing passwords are never displayed to Admin.


## v1.0.28 Demand Link Notes

When creating a public upload link, recruiters can optionally select a demand record. The link will use that demand for resume scoring and will automatically create/update the shortlist entry after upload.


## v1.0.28 Mac Virtual Environment Fix

This release improves startup on Macs where `/Library/Frameworks/Python.framework/Versions/3.13/bin/python3 -m venv` fails during `ensurepip`.

Recommended clean start:

```bash
cd truflux_resume_portal_v1.0.28_mac_venv_fix
./clean_start_mac.sh
```

If the same error appears, install Homebrew Python 3.12 and force the launcher to use it:

```bash
brew install python@3.12
cd truflux_resume_portal_v1.0.28_mac_venv_fix
rm -rf backend/.venv
TRUFLUX_PYTHON=/opt/homebrew/bin/python3.12 python3 start_dev.py
```

The app still includes all v1.0.28 features: demand-linked public upload links, admin password control, security hardening, demand-side module, resume intelligence, and availability fields.


## v1.0.28 updates
- Demand records now generate 10 skill-based MCQs on the fly.
- Demand-linked public upload links require candidates to complete MCQs before resume upload.
- MCQ score is stored with the public resume upload and shortlist note.
- Create 50 test data button moved from Dashboard to Admin > User Management.


## v1.0.28 Created Date Trends

- Added explicit `created_date` to candidate/supply records.
- Added explicit `created_date` to demand records.
- Existing records are automatically backfilled from `created_at`.
- Demand trend now uses `created_date` first, with `created_at` as fallback.
- Supply trend now uses `created_date` first, with `created_at` as fallback.


## v1.0.28 Startup Fix

- Cleaned `start_dev.py` so it contains Python code only.
- Retained v1.0.28 created_date trend changes.
- Demand and supply trends continue to use `created_date` first and `created_at` as fallback.


## v1.0.28 Demo Data Button Fix

- Fixed the demo-data backend insert after adding `created_date`.
- Create Demo Data now correctly creates 50 candidates and 8 demand records.
- Intelligence trends refresh after demo data is created.


## v1.0.28 Fake Risk RAG

- Added Green / Amber / Red RAG status for fake-resume risk.
- Resume Bank now shows RAG beside the fake-risk score.
- Candidate detail now shows a Fake Risk RAG card.
- API now enriches candidate records with `fake_risk_rag`, `fake_risk_rag_label`, and `fake_risk_rag_action`.


## v1.0.28 Vite Cache Fix

- Fixed recurring Vite missing `dep-*.js` chunk errors caused by stale or partially installed `node_modules`.
- `start_dev.py` now verifies Vite before startup and reinstalls frontend dependencies if corrupted.
- `clean_start_mac.sh` now removes Vite optimizer cache and npm lock artifacts.
- Added `repair_frontend_mac.sh` for quick frontend-only repair.


## v1.0.28 Login Fetch Fix

- Fixed login `Failed to fetch` caused by frontend/backend URL mismatch.
- Vite now proxies local `/api` calls to the actual backend port selected by the launcher.
- `start_dev.py` waits for `/api/health` before starting the frontend.
- Backend allows local network browser origins as a fallback.


## v1.0.28 TLS Certificate Fix

- Fixed pip failures caused by stale `certifi/cacert.pem` paths inside `backend/.venv`.
- Startup now clears stale certificate environment variables before pip installs.
- If pip/certifi is broken, the launcher recreates `backend/.venv` and retries.
- Added `repair_backend_mac.sh` for backend-only repair.


## v1.0.28 Public Link MCQ + Copy URL

- Public upload link creation now has a checkbox to include or exclude MCQ screening.
- MCQ is available only when a demand record is selected.
- If MCQ is excluded, the candidate can upload the resume directly even when the link is demand-linked.
- Public Links table now shows whether MCQ is included.
- Added Copy URL button after link creation and in the links table.


## v1.0.28 Photograph + Standardized Resume

- Public resume upload now asks for a recent candidate photograph.
- First-time public uploads require a photograph; update-only uploads can optionally replace/add one.
- Candidate profile stores photograph file name/path securely.
- Candidate profile captures current/last company, previous companies, and project/company details.
- Resume Bank now has a Create Resume button per profile.
- Candidate Detail now has a button to create/download a standardized Truflux/1Resource resume.
- Standard resume includes candidate details, company/project details, skills, screening scores, fake-risk RAG, and commercial details.


## v1.0.28 PDF Resume + Company Profile

- Create Resume now generates a formatted PDF instead of a text file.
- PDF resume uses candidate email ID, phone number, location, availability, company/project details, skills, screening scores and fake-risk RAG.
- Admin now has a Company Profile section.
- Company Profile captures company logo, company number/CIN, tax/GST number, address, phone, email and website.
- Generated PDF resumes use the company profile details and logo in the header.
- ReportLab added for programmatic PDF generation.


## v1.0.28 Company Profile Save Fix

- Fixed Company Profile save reliability in Admin.
- Backend now uses explicit insert/update logic for company profile saves.
- Added company profile column migrations for existing databases.
- Frontend now submits through a form, shows saving status, reloads saved data, and displays last saved time.
- Logo upload now ensures the company profile row exists before saving the logo.
