#!/bin/bash
set -e

cd /home/ec2-user/awsproject
export NODE_ENV=production
export PORT=3000

if pm2 show awsproject >/dev/null 2>&1; then
  pm2 restart awsproject --update-env
else
  pm2 start "npm start" --name awsproject --watch false --time
fi

pm2 save

echo "[start] Application started with PM2"
