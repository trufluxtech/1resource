# 1Resource v1.0.28

A local Python + Node.js portal for Truflux resource supply, client demand, candidate resume intelligence, public resume uploads, shortlist management, and app security controls.

## What's included

- Python FastAPI backend
- React / Vite frontend
- SQLite database
- Login and user management
- Candidate resume bank
- Multiple role-based resumes per candidate
- Resume upload and candidate auto-update
- 48-hour public candidate upload links
- Public link first-use lock: first upload creates/binds the candidate; later uploads only update the same candidate resume
- Public upload link revoke control
- Demand-side role requests
- Candidate-to-demand matching
- Demand shortlist pipeline
- 50 test candidate data button
- Demo demand requests
- ML-style skill analytics
- Resume fit rating
- Fake-resume risk identification
- Collapsible left menu
- Improved responsive UI alignment
- CSV export
- Activity logs
- Mac-friendly Python 3.13 dependency handling

## Security hardening added in v1.0.28

- Restricted CORS origins instead of wide-open `*`
- HTTP security headers
- Session expiry with configurable session TTL
- Login failed-attempt lockout
- Admin unlock user flow
- Password policy for new and changed passwords
- Change password screen
- Upload file extension validation
- Upload file size validation
- Safe upload filename handling
- Safe authenticated resume downloads
- Public upload token format validation
- Public upload link revoke action
- Public upload repeat-use locked to resume-only update for the same candidate
- Security Centre screen for admin review
- Security status API
- Additional audit logging for security-sensitive actions

## Run locally on Mac

```bash
cd truflux_resume_portal_v1.0.28_mac_venv_fix
python3 start_dev.py
```

Open:

```text
http://localhost:5173
```

Default login:

```text
Admin / admin123
```

## Clean start on Mac

```bash
cd truflux_resume_portal_v1.0.28_mac_venv_fix
./clean_start_mac.sh
```

## Main menu

- Dashboard
- Demand
- Resume Bank
- Intelligence
- Public Links
- Security
- Admin

## Public upload link behavior

A recruiter can create a 48-hour public upload URL. On first use, the link either creates a new candidate or binds to the selected existing candidate. After first use, the same URL cannot create another candidate. It remains usable only for updated resume uploads against the same candidate until the 48-hour expiry or until the recruiter revokes the link.

## Environment variables

```text
SESSION_TTL_HOURS=8
MAX_UPLOAD_MB=10
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000
DATA_DIR=backend/data
DATABASE_PATH=backend/data/resume_bank.db
```

For Railway or a public deployment, set `ALLOWED_ORIGINS` to the actual frontend/public domain.

## Version

1Resource v1.0.28 — Security Hardening + Loose Ends Release


## v1.0.28 Admin Password Control

- Admin can reset/change password for any user from Admin > User Management.
- Reset clears that user's active sessions.
- Admin can choose whether the user must change password on next login.
- Existing passwords are never displayed to Admin.

## v1.0.28 Demand-Linked Public Upload Links

- Public upload links can now be optionally connected to a demand record.
- Selecting a demand auto-fills the role title and role definition if those fields are blank.
- Candidate uploads through a demand-linked public URL are rated against that demand.
- The uploaded candidate is automatically added or updated in that demand's shortlist as `Resume Uploaded`.
- Demand-linked URLs still follow the security rule: first use creates/binds the candidate; repeat use only updates the same candidate's resume.
- Public upload page now shows the linked demand context to the candidate.


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
