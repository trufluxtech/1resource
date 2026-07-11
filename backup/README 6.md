# 1Resource v1.0.19

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

## Security hardening added in v1.0.10

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
cd truflux_resume_portal_v1.0.19_mac_venv_fix
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
cd truflux_resume_portal_v1.0.19_mac_venv_fix
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

1Resource v1.0.19 — Security Hardening + Loose Ends Release


## v1.0.10 Admin Password Control

- Admin can reset/change password for any user from Admin > User Management.
- Reset clears that user's active sessions.
- Admin can choose whether the user must change password on next login.
- Existing passwords are never displayed to Admin.

## v1.0.19 Demand-Linked Public Upload Links

- Public upload links can now be optionally connected to a demand record.
- Selecting a demand auto-fills the role title and role definition if those fields are blank.
- Candidate uploads through a demand-linked public URL are rated against that demand.
- The uploaded candidate is automatically added or updated in that demand's shortlist as `Resume Uploaded`.
- Demand-linked URLs still follow the security rule: first use creates/binds the candidate; repeat use only updates the same candidate's resume.
- Public upload page now shows the linked demand context to the candidate.


## v1.0.19 Mac Virtual Environment Fix

This release improves startup on Macs where `/Library/Frameworks/Python.framework/Versions/3.13/bin/python3 -m venv` fails during `ensurepip`.

Recommended clean start:

```bash
cd truflux_resume_portal_v1.0.19_mac_venv_fix
./clean_start_mac.sh
```

If the same error appears, install Homebrew Python 3.12 and force the launcher to use it:

```bash
brew install python@3.12
cd truflux_resume_portal_v1.0.19_mac_venv_fix
rm -rf backend/.venv
TRUFLUX_PYTHON=/opt/homebrew/bin/python3.12 python3 start_dev.py
```

The app still includes all v1.0.11 features: demand-linked public upload links, admin password control, security hardening, demand-side module, resume intelligence, and availability fields.


## v1.0.19 updates
- Demand records now generate 10 skill-based MCQs on the fly.
- Demand-linked public upload links require candidates to complete MCQs before resume upload.
- MCQ score is stored with the public resume upload and shortlist note.
- Create 50 test data button moved from Dashboard to Admin > User Management.


## v1.0.19 Created Date Trends

- Added explicit `created_date` to candidate/supply records.
- Added explicit `created_date` to demand records.
- Existing records are automatically backfilled from `created_at`.
- Demand trend now uses `created_date` first, with `created_at` as fallback.
- Supply trend now uses `created_date` first, with `created_at` as fallback.


## v1.0.19 Startup Fix

- Cleaned `start_dev.py` so it contains Python code only.
- Retained v1.0.18 created_date trend changes.
- Demand and supply trends continue to use `created_date` first and `created_at` as fallback.
