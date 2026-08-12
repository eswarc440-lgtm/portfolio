#!/bin/bash
set -e

if pm2 show awsproject >/dev/null 2>&1; then
  pm2 stop awsproject || true
  pm2 delete awsproject || true
fi

echo "[stop] Stopped previous app instance if present"
