# 1Resource Production 1.18 Clean Git-Ready Build

This build is prepared for GitHub/Railway deployment.

Removed from the package:
- node_modules
- Python virtual environments
- SQLite databases
- runtime uploads/data folders
- cache folders
- ZIP/log files

Before pushing:
```bash
git add -A --verbose
git commit -m "Production 1.18 clean build"
git push -u origin main
```

Railway production variables:
```text
APP_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATA_DIR=/data
SESSION_TTL_HOURS=8
```

Railway volume mount:
```text
/data
```
