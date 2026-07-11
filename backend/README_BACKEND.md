# Truflux Resource Bank Backend v1.0.10

Default login:
- Username: `Admin`
- Password: `admin123`

Run locally:

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install --prefer-binary -r requirements.txt
uvicorn main:app --reload --port 8000
```

Health check: http://localhost:8000/api/health

## Security controls

- Restricted CORS origins via `ALLOWED_ORIGINS`
- Session expiry via `SESSION_TTL_HOURS`
- Failed-login lockout
- Upload extension and size validation via `MAX_UPLOAD_MB`
- Authenticated resume downloads
- Revocable 48-hour public upload links
- Audit logs for login, public upload, candidate, demand, user, and link actions


## v1.0.10 Admin Password Control

- Admin can reset/change password for any user from Admin > User Management.
- Reset clears that user's active sessions.
- Admin can choose whether the user must change password on next login.
- Existing passwords are never displayed to Admin.
