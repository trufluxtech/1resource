# Truflux Resource Bank Portal v1.0.6

A local Python + Node.js portal for building and managing the Truflux resume database, screening candidates, storing multiple role-wise resumes, and running resume intelligence.

## What is included

- Python FastAPI backend
- React / Vite frontend
- SQLite database
- Login and user management
- Candidate repository / resume bank
- 50 test-data generator button
- Candidate screening and scoring
- Multiple resumes per candidate for different role definitions
- Resume upload with role title and role definition
- Automatic candidate-record update from uploaded resume
- ML-style resume rating against the role definition
- ML-style fake-resume risk detection
- Skill supply / demand analytics
- Public candidate upload links valid for 48 hours
- CSV export
- Activity logs
- Mac and Windows startup scripts
- Railway deployment files

## Default login

```text
Username: Admin
Password: admin123
```

## Run on Mac / Linux

```bash
cd truflux_resume_portal_v1_0_5_resume_intelligence
python3 start_dev.py
```

Or double-click:

```text
start_mac.command
```

Then open:

```text
http://localhost:5173
```

## Run on Windows

```bat
cd truflux_resume_portal_v1_0_5_resume_intelligence
python start_dev.py
```

Or double-click:

```text
start_dev_windows.bat
```

## Public resume upload link workflow

1. Login as Admin or Recruiter.
2. Open **Public Upload Links**.
3. Enter role title and role definition.
4. Optionally link the upload to an existing candidate.
5. Create the link.
6. Copy and send the link to the candidate.
7. Candidate uploads resume within 48 hours.
8. The system extracts the resume text, rates the resume, identifies skill matches/gaps, checks fake-resume risk, and creates or updates the candidate record.

## Resume intelligence note

The resume rating and fake-resume detection are local, lightweight ML-style scoring models. They do not require external APIs. They are designed to assist screening, not replace recruiter and technical evaluator judgment.


## v1.0.6 Mac / Python 3.13 Fix

If you see `Failed building wheel for pydantic-core`, your Mac is using Python 3.13 with older dependency pins. This build fixes that.

Run:

```bash
rm -rf backend/.venv
python3 start_dev.py
```

Or:

```bash
./clean_start_mac.sh
```
