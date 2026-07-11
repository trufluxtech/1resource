# 1Resource — Production 1 Release

## Release status

This build freezes the current feature set as **Production 1**.

## Production database

Production 1 supports:

- SQLite for local quick-start and demos
- PostgreSQL for production deployment through `DATABASE_URL`

If `DATABASE_URL` starts with `postgres://` or `postgresql://`, the backend uses PostgreSQL automatically.
If `DATABASE_URL` is not set, the backend uses local SQLite.

## Default users

| Username | Password | Role |
|---|---:|---|
| Admin | [removed default credential] | Admin |
| Recruiter | [removed default credential] | Recruiter |

## PostgreSQL setup

Create or attach a PostgreSQL database and set:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
```

Then start the backend. Tables are created automatically on startup.

## Railway setup

1. Add a PostgreSQL service in Railway.
2. Link the `DATABASE_URL` variable to the web service.
3. Deploy using the included Dockerfile.
4. Health check path: `/api/health`.

## Local run

```bash
cd /Users/satyassrinivasan/Desktop/1resource
chmod +x clean_start_mac.sh
./clean_start_mac.sh
```

## Production behavior

- Candidate contact details are not revealed in generated resume PDFs.
- Resume PDFs use the logged-in user's profile email and phone as authorized contact.
- Company profile details are used in generated resume PDF headers.
- Public upload links support optional MCQ screening.
- Public uploads require candidate photograph for first-time upload.


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
