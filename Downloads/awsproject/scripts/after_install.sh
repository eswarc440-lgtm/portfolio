#!/bin/bash
set -e

cd /home/ec2-user/awsproject

echo "[after_install] Installing app dependencies..."
npm install --no-fund --no-audit

echo "[after_install] Building production bundle..."
npm run build

# Optional: ensure the production build output exists
if [ ! -f /home/ec2-user/awsproject/dist/server.cjs ]; then
  echo "[after_install] ERROR: dist/server.cjs was not generated."
  exit 1
fi
