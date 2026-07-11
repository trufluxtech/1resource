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
| Admin | admin123 | Admin |
| Recruiter | recruiter123 | Recruiter |

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
