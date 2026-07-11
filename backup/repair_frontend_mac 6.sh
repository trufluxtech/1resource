#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "Repairing frontend Vite dependencies..."
rm -rf frontend/node_modules frontend/package-lock.json frontend/.vite frontend/node_modules/.vite
npm cache verify || true
npm config set registry https://registry.npmjs.org/
cd frontend
npm install --no-audit --no-fund --progress=false
node -e "import('vite').then(()=>console.log('Vite dependency check passed')).catch(e=>{console.error(e); process.exit(1)})"
cd ..
echo "Frontend repaired. Now run: ./clean_start_mac.sh"
