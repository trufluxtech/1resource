# 1Resource vProduction 1

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

## Security hardening added in vProduction 1

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
cd truflux_resume_portal_vProduction 1_mac_venv_fix
python3 start_dev.py
```

Open:

```text
http://localhost:5173
```

Default login:

```text
[removed default credential]
```

## Clean start on Mac

```bash
cd truflux_resume_portal_vProduction 1_mac_venv_fix
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

1Resource vProduction 1 — Security Hardening + Loose Ends Release


## vProduction 1 Admin Password Control

- Admin can reset/change password for any user from Admin > User Management.
- Reset clears that user's active sessions.
- Admin can choose whether the user must change password on next login.
- Existing passwords are never displayed to Admin.

## vProduction 1 Demand-Linked Public Upload Links

- Public upload links can now be optionally connected to a demand record.
- Selecting a demand auto-fills the role title and role definition if those fields are blank.
- Candidate uploads through a demand-linked public URL are rated against that demand.
- The uploaded candidate is automatically added or updated in that demand's shortlist as `Resume Uploaded`.
- Demand-linked URLs still follow the security rule: first use creates/binds the candidate; repeat use only updates the same candidate's resume.
- Public upload page now shows the linked demand context to the candidate.


## vProduction 1 Mac Virtual Environment Fix

This release improves startup on Macs where `/Library/Frameworks/Python.framework/Versions/3.13/bin/python3 -m venv` fails during `ensurepip`.

Recommended clean start:

```bash
cd truflux_resume_portal_vProduction 1_mac_venv_fix
./clean_start_mac.sh
```

If the same error appears, install Homebrew Python 3.12 and force the launcher to use it:

```bash
brew install python@3.12
cd truflux_resume_portal_vProduction 1_mac_venv_fix
rm -rf backend/.venv
TRUFLUX_PYTHON=/opt/homebrew/bin/python3.12 python3 start_dev.py
```

The app still includes all vProduction 1 features: demand-linked public upload links, admin password control, security hardening, demand-side module, resume intelligence, and availability fields.


## vProduction 1 updates
- Demand records now generate 10 skill-based MCQs on the fly.
- Demand-linked public upload links require candidates to complete MCQs before resume upload.
- MCQ score is stored with the public resume upload and shortlist note.
- Create 50 test data button moved from Dashboard to Admin > User Management.


## vProduction 1 Created Date Trends

- Added explicit `created_date` to candidate/supply records.
- Added explicit `created_date` to demand records.
- Existing records are automatically backfilled from `created_at`.
- Demand trend now uses `created_date` first, with `created_at` as fallback.
- Supply trend now uses `created_date` first, with `created_at` as fallback.


## vProduction 1 Startup Fix

- Cleaned `start_dev.py` so it contains Python code only.
- Retained vProduction 1 created_date trend changes.
- Demand and supply trends continue to use `created_date` first and `created_at` as fallback.


## vProduction 1 Demo Data Button Fix

- Fixed the demo-data backend insert after adding `created_date`.
- Create Demo Data now correctly creates 50 candidates and 8 demand records.
- Intelligence trends refresh after demo data is created.


## vProduction 1 Fake Risk RAG

- Added Green / Amber / Red RAG status for fake-resume risk.
- Resume Bank now shows RAG beside the fake-risk score.
- Candidate detail now shows a Fake Risk RAG card.
- API now enriches candidate records with `fake_risk_rag`, `fake_risk_rag_label`, and `fake_risk_rag_action`.


## vProduction 1 Vite Cache Fix

- Fixed recurring Vite missing `dep-*.js` chunk errors caused by stale or partially installed `node_modules`.
- `start_dev.py` now verifies Vite before startup and reinstalls frontend dependencies if corrupted.
- `clean_start_mac.sh` now removes Vite optimizer cache and npm lock artifacts.
- Added `repair_frontend_mac.sh` for quick frontend-only repair.


## vProduction 1 Login Fetch Fix

- Fixed login `Failed to fetch` caused by frontend/backend URL mismatch.
- Vite now proxies local `/api` calls to the actual backend port selected by the launcher.
- `start_dev.py` waits for `/api/health` before starting the frontend.
- Backend allows local network browser origins as a fallback.


## vProduction 1 TLS Certificate Fix

- Fixed pip failures caused by stale `certifi/cacert.pem` paths inside `backend/.venv`.
- Startup now clears stale certificate environment variables before pip installs.
- If pip/certifi is broken, the launcher recreates `backend/.venv` and retries.
- Added `repair_backend_mac.sh` for backend-only repair.


## vProduction 1 Public Link MCQ + Copy URL

- Public upload link creation now has a checkbox to include or exclude MCQ screening.
- MCQ is available only when a demand record is selected.
- If MCQ is excluded, the candidate can upload the resume directly even when the link is demand-linked.
- Public Links table now shows whether MCQ is included.
- Added Copy URL button after link creation and in the links table.


## vProduction 1 Photograph + Standardized Resume

- Public resume upload now asks for a recent candidate photograph.
- First-time public uploads require a photograph; update-only uploads can optionally replace/add one.
- Candidate profile stores photograph file name/path securely.
- Candidate profile captures current/last company, previous companies, and project/company details.
- Resume Bank now has a Create Resume button per profile.
- Candidate Detail now has a button to create/download a standardized Truflux/1Resource resume.
- Standard resume includes candidate details, company/project details, skills, screening scores, fake-risk RAG, and commercial details.


## vProduction 1 PDF Resume + Company Profile

- Create Resume now generates a formatted PDF instead of a text file.
- PDF resume uses candidate email ID, phone number, location, availability, company/project details, skills, screening scores and fake-risk RAG.
- Admin now has a Company Profile section.
- Company Profile captures company logo, company number/CIN, tax/GST number, address, phone, email and website.
- Generated PDF resumes use the company profile details and logo in the header.
- ReportLab added for programmatic PDF generation.


## vProduction 1 Company Profile Save Fix

- Fixed Company Profile save reliability in Admin.
- Backend now uses explicit insert/update logic for company profile saves.
- Added company profile column migrations for existing databases.
- Frontend now submits through a form, shows saving status, reloads saved data, and displays last saved time.
- Logo upload now ensures the company profile row exists before saving the logo.


## vProduction 1 Uploaded Resume Details in PDF

- Standard resume PDF now includes details from uploaded resume documents.
- The PDF includes uploaded resume version, file name, role title, source/uploaded date, detected contact details, detected skills/domains, fit score, fake-risk score, matches/gaps and extracted resume content.
- Supports multiple uploaded resume versions, showing the latest versions first.
- If no uploaded resume document exists, the PDF clearly shows that no uploaded document text is available.


## vProduction 1 Confidential Candidate Contact in PDF

- Generated resume PDF no longer reveals candidate email ID or phone number.
- Candidate contact is shown as: "Suppressed - shared through authorized recruiter".
- Email IDs and phone numbers extracted from uploaded resume documents are also suppressed.
- Extracted resume content is redacted before inclusion in the PDF.
- Company profile email and phone can still appear in the PDF header as company contact information.


## vProduction 1 Login Profile Contact in PDF

- Generated resume PDF now uses the logged-in user's profile email and phone as the authorized contact.
- Candidate email ID and phone number remain suppressed.
- Email IDs and phone numbers extracted from uploaded resumes remain redacted.
- Added My Login Profile page where each user can maintain full name, authorized email and authorized phone.
- Admin user creation now supports login profile email and phone fields.


## vProduction 1 User Management Fix

- Fixed Create User error messages so validation and backend errors are visible on the Admin screen.
- Added default Recruiter profile for demos:
  - Username: Recruiter
  - Password: [removed default credential]
  - Role: Recruiter
  - Authorized email: recruiter@truflux.ai
  - Authorized phone: +91 00000 00000
- Added Edit User feature in Admin to update username, full name, authorized email, authorized phone and role.
- User table now supports editing login-profile contact details used in downloadable resume PDFs.


## vProduction 1 NPM Startup Fix

- Normal clean start no longer deletes `frontend/node_modules`, so the app will not repeatedly run `npm install`.
- `start_dev.py` now verifies Vite and skips npm install when dependencies are already working.
- Added npm registry ping before first install so network/proxy issues fail clearly instead of appearing stuck.
- Added install timeout and clearer recovery instructions.
- Added `full_clean_start_mac.sh` for the rare case where a full frontend dependency reset is required.
- `repair_frontend_mac.sh` now pings npm registry and then runs install with clearer logs.


## Production 1 PostgreSQL Support

This build is frozen as **Production 1**.

The app now supports PostgreSQL for production. Set `DATABASE_URL` to a PostgreSQL connection string:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
```

If `DATABASE_URL` is not set, the app continues to run with local SQLite for demos.

Default production/demo users:

```text
[removed default credential]
[removed default credential]
```

For Railway, add a PostgreSQL service and link its `DATABASE_URL` to this application.


## Production 1.1 Demand Read-only Client Details

- Clicking a demand row opens a read-only client details panel before any edit.
- Demand edit form now shows client, project, domain, location, work mode, rate, cost, start date and duration as read-only context.
- Only operational demand fields such as role title, required skills, priority, status, positions and role definition remain editable.


## Production 1.2 PostgreSQL Table Creation Order Fix

- Fixed Railway/PostgreSQL startup crash during `init_db()`.
- `public_upload_links` is now created before `public_mcq_results`.
- This resolves PostgreSQL foreign-key validation failure where `public_mcq_results.public_link_id` referenced `public_upload_links(id)` before that table existed.
- Railway healthcheck should now reach `/api/health` after deployment instead of failing during container startup.


## Production 1.3 Railway PORT Fix

- Fixed Railway healthcheck timeout caused by the Docker container binding only to port 8000.
- Dockerfile now uses Railway's runtime `PORT` variable:
  `uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}`
- Local Docker runs still default to port 8000 if `PORT` is not set.


## Production 1.4 Demo Data Success Handling Fix

- Fixed the Admin `Create 50 test data` action showing `failed` even when demo candidates and demand records were created.
- Backend now returns a clean success response even if the non-critical audit-log insert fails after demo data has already been committed.
- Frontend now separates demo-data creation from screen refreshes, so a refresh failure does not incorrectly mark data creation as failed.
- If demo data is created but a dashboard refresh fails, the UI now shows a partial-refresh warning instead of a failed creation message.


## Production 1.5 Admin Customer Outreach

- Added a new Admin-only `Outreach` page.
- Admin can maintain a potential client/customer list with company, contact name, email ID, phone, segment, status and notes.
- Admin can view internal user email IDs from login profiles.
- Admin can send or queue three types of emails:
  - Encourage to use
  - Release notes
  - Shutdown details
- Added email outreach logs showing recipient, type, subject, status and errors.
- SMTP sending is supported through environment variables:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USE_TLS`
  - `SMTP_FROM_EMAIL`
  - `SMTP_FROM_NAME`
  - `SMTP_USERNAME`
  - `SMTP_PASSWORD`
- If SMTP is not configured, emails are safely logged as queued instead of being silently lost.


## Production 1.6 UI, Outreach and User DP

- Moved logout from the left sidebar to the top-right corner as an icon-only button.
- Added user display picture support in the login profile.
- The user's DP is now shown in the top-right header and profile page.
- Rearranged the Admin Outreach page into a clearer workspace:
  - summary cards
  - client editor
  - potential client directory
  - sticky email composer
  - user email IDs
  - email history
- Made client edit/delete actions clearer with `Edit details` and `Delete` buttons.


## Production 1.7 SMTP Diagnostics

- Added Admin Outreach SMTP status endpoint and `Test SMTP` button.
- Improved SMTP error messages, especially DNS failures such as `[Errno -3] Temporary failure in name resolution`.
- If SMTP_HOST cannot be resolved, the app now clearly instructs the Admin to check Railway Variables and provider SMTP hostname.
- Outreach page now shows whether SMTP is configured and which host/port/from email are being used.


## Production 1.8 Mailjet API Email Sending

- Added Mailjet Send API v3.1 support over HTTPS.
- This avoids Railway outbound SMTP port timeouts such as port 2525, 587 and 465.
- Set `EMAIL_PROVIDER=mailjet_api` in Railway.
- Required Mailjet API variables:
  - `MAILJET_API_KEY`
  - `MAILJET_SECRET_KEY`
  - `EMAIL_FROM`
  - `EMAIL_FROM_NAME`
- Outreach page now tests the active email provider, not just SMTP.
- SMTP support remains available for environments where SMTP ports are reachable.


## Production 1.9 Logo Navigation and Horizontal Scroll Fix

- Clicking the left-side 1Resource logo now takes the user back to the Dashboard/Home page.
- Added horizontal scrolling for tables and dense content areas.
- Table text no longer wraps by default, keeping columns readable with horizontal scroll.


## Production 1.10 Secure Admin Bootstrap

- Removed automatic creation of default `Admin` and `Recruiter` users.
- The app no longer ships with or pre-fills default login credentials.
- For a fresh database, create the first Admin only through explicit deployment variables:
  - `INITIAL_ADMIN_USERNAME`
  - `INITIAL_ADMIN_PASSWORD`
  - `INITIAL_ADMIN_FULL_NAME`
  - `INITIAL_ADMIN_EMAIL`
  - `INITIAL_ADMIN_PHONE`
- If these variables are not set and the database has no users, the app starts normally but nobody can log in until an Admin is bootstrapped.
- Existing users in an existing production database are not changed automatically.


## Production 1.11 Default Users with Blank Login

- Restored automatic creation of the default Admin and Recruiter users for setup/demo readiness.
- Login page remains blank and does not pre-fill the Admin username or password.
- Login page no longer displays default credentials.
- Admin should change default passwords after first login.


## Production 1.12 Strict Intelligence, Resume Parsing and Experience Color Coding

- Candidate suitability and role-based shortlist now use stricter scoring.
- Required skill coverage is now the dominant scoring factor.
- Candidates with zero required-skill match are capped as not suitable.
- Low required-skill coverage is capped and shown with strict notes.
- Matching now returns required skills, available skills, skill coverage percentage, title fit, domain fit and experience fit.
- Resume parsing improved for PDF/DOCX/TXT:
  - Better name detection
  - Better email/phone detection
  - Better skill extraction with Salesforce, Azure DevOps, HL7/FHIR, Terraform and data engineering terms
  - Better experience detection from direct years, total experience labels and year ranges
  - DOCX table text extraction added
- Resume Bank rows are color-coded by total experience:
  - White: 0 years
  - Green: 3+ years
  - Pink: 5 years
  - Purple: above 5 to 10 years
  - Yellow: 10 to 20 years
  - Blue: 20+ years


## Production 1.13 PostgreSQL Enforced for Railway

- Production mode now requires PostgreSQL.
- If `APP_ENV=production` and `DATABASE_URL` is missing, the app will fail fast instead of silently using local SQLite.
- `/api/health` now shows the active database engine:
  - `database: postgresql` when Railway PostgreSQL is active
  - `database: sqlite` only for local development
- This prevents deployment data from being reset when a new ZIP/version is pushed.
- Keep uploaded files persistent by mounting a Railway Volume at `/data` and setting `DATA_DIR=/data`.

Required Railway variables:
```text
APP_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATA_DIR=/data
```

Recommended Mailjet variables:
```text
EMAIL_PROVIDER=mailjet_api
MAILJET_API_KEY=your-mailjet-api-key
MAILJET_SECRET_KEY=your-mailjet-secret-key
EMAIL_FROM=your-verified-sender@yourdomain.com
EMAIL_FROM_NAME=1Resource Team
```


## Production 1.14 Client and Project Combobox

- Demand creation now uses combobox fields for Client Name and Project Name.
- Users can select from previously entered clients/projects or type a new value.
- Project dropdown is filtered by the selected client when possible.
- Existing edit behavior is preserved: client/project details remain read-only during demand edit.
