# Mac Run Guide — 1Resource v1.0.15

## Start

```bash
cd truflux_resume_portal_v1.0.15_mac_venv_fix
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
cd truflux_resume_portal_v1.0.15_mac_venv_fix
./clean_start_mac.sh
```

## Manual backend reset

```bash
cd truflux_resume_portal_v1.0.15_mac_venv_fix
rm -rf backend/.venv
python3 start_dev.py
```

## Manual frontend reset

```bash
cd truflux_resume_portal_v1.0.15_mac_venv_fix/frontend
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


## v1.0.10 Admin Password Control

- Admin can reset/change password for any user from Admin > User Management.
- Reset clears that user's active sessions.
- Admin can choose whether the user must change password on next login.
- Existing passwords are never displayed to Admin.


## v1.0.15 Demand Link Notes

When creating a public upload link, recruiters can optionally select a demand record. The link will use that demand for resume scoring and will automatically create/update the shortlist entry after upload.


## v1.0.15 Mac Virtual Environment Fix

This release improves startup on Macs where `/Library/Frameworks/Python.framework/Versions/3.13/bin/python3 -m venv` fails during `ensurepip`.

Recommended clean start:

```bash
cd truflux_resume_portal_v1.0.15_mac_venv_fix
./clean_start_mac.sh
```

If the same error appears, install Homebrew Python 3.12 and force the launcher to use it:

```bash
brew install python@3.12
cd truflux_resume_portal_v1.0.15_mac_venv_fix
rm -rf backend/.venv
TRUFLUX_PYTHON=/opt/homebrew/bin/python3.12 python3 start_dev.py
```

The app still includes all v1.0.11 features: demand-linked public upload links, admin password control, security hardening, demand-side module, resume intelligence, and availability fields.


## v1.0.15 Intelligence Detail Update

- Added demand-specific intelligence analysis.
- Added candidate-specific intelligence analysis.
- Intelligence page now shows selected demand skill coverage, top candidate matches, cost fit and availability fit.
- Intelligence page now shows selected candidate readiness, resume risk, best-fit open demands and recommended next actions.
