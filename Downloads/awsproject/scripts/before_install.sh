#!/bin/bash
set -e

echo "[before_install] Ensuring required runtime tools exist..."
if ! command -v node >/dev/null 2>&1; then
  sudo yum install -y nodejs npm
fi

if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2
fi

echo "[before_install] Cleaning previous deployment..."
if [ -d /home/ec2-user/awsproject ]; then
  sudo rm -rf /home/ec2-user/awsproject
fi

mkdir -p /home/ec2-user/awsproject
