# Truflux Resource Bank Portal v1.0.2

A working Python + Node.js portal for Truflux to manage a screened resume database, reduce vendor dependency, and control rate-card inflation.

## What is included

- Python FastAPI backend
- React + Vite Node.js frontend pinned to Node 18-compatible versions
- SQLite database
- Login and role-based access
- Candidate master / resume bank
- Skill matrix fields
- Screening assessment and scoring model
- A1 / A2 / B / Rejected status classification
- Resume file upload/download
- Search and filters
- Dashboard and skill mix
- CSV export
- User management
- Activity logs
- Demo data generator
- Dockerfile for deployment
- Railway config

## Default login

```text
Username: Admin
Password: admin123
```

Please change the default password before using this beyond a demo.

---

## Important startup notes

- Extract the ZIP fully before running. Do not run the scripts directly from inside the ZIP preview.
- Install Python 3.10+ and Node.js 18+ LTS.
- This build pins Vite to a Node 18-compatible version to avoid startup errors on machines that do not yet have Node 20+.


# Local execution

## Option 1: One-command local dev start

### macOS

```bash
cd truflux_resume_portal
python3 start_dev.py
```

You can also double-click `start_mac.command`. If macOS blocks it, run:

```bash
chmod +x start_mac.command
./start_mac.command
```

### Windows / Linux

```bash
python start_dev.py
```

This starts the backend and frontend. If ports 8000 or 5173 are busy, the launcher automatically chooses another free port and prints the correct URL.

On Windows, you can also double-click or run:

```bat
start_dev_windows.bat
```

## Option 2: Run backend and frontend separately

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend health check:

```text
http://localhost:8000/api/health
```

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

When running separately, the frontend calls the backend using relative paths. For dev proxy, you may add `VITE_API_BASE=http://localhost:8000` if required.

---

## Option 3: Build frontend and serve through FastAPI

```bash
cd frontend
npm install
npm run build

cd ../backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Then open:

```text
http://localhost:8000
```

---

# Docker execution

```bash
docker build -t truflux-resource-bank .
docker run -p 8000:8000 truflux-resource-bank
```

Open:

```text
http://localhost:8000
```

---

# Railway deployment

This repository includes:

- `Dockerfile`
- `railway.json`
- `Procfile`

Recommended Railway flow:

1. Push this folder to GitHub.
2. Create a new Railway project.
3. Deploy from GitHub repository.
4. Railway will use the Dockerfile.
5. Open the generated Railway URL.

Optional persistent database setup:

- Add a Railway volume.
- Set environment variable `DATA_DIR=/data`.
- SQLite database and uploaded resumes will then be stored under `/data`.

---

# Roles

| Role | Access |
|---|---|
| Admin | Full access, users, logs, delete candidates |
| Recruiter | Add/edit candidates, upload resumes, create demo data |
| Evaluator | Add assessments |
| Viewer | Read-only access |

---

# Candidate scoring model

| Criteria | Max Score |
|---|---:|
| Technical skill | 30 |
| Relevant project experience | 15 |
| Practical test | 20 |
| Communication | 10 |
| Client readiness | 10 |
| Cost fitment | 10 |
| Availability | 5 |
| Total | 100 |

## Classification

| Score | Classification |
|---:|---|
| 85+ | A1 - Ready to Deploy |
| 75–84 | A2 - Deployable in 15 Days |
| 65–74 | B - Keep Warm |
| Below 65 | Rejected / Archive |

---

# Recommended next enhancements

- Add client project mapping and deployment history
- Add Truflux-format PDF resume generation
- Add approval workflow for A1 candidates
- Add vendor resource tagging
- Add internal billing rate versus customer billing rate calculator
- Add bench utilization dashboard
- Add email notifications for upcoming availability
