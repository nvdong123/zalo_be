#!/bin/bash
# Quick Python Upgrade Script for VPS

echo "🐍 Quick Python 3.11 Upgrade"
echo "============================="

# Install Python 3.11
sudo apt update
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev

# Install pip for Python 3.11
curl -sS https://bootstrap.pypa.io/get-pip.py | sudo python3.11

# Update project
cd /var/www/hotel-backend/backend
sudo rm -rf venv
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip

# Copy latest requirements
cp app/requirements_latest.txt app/requirements.txt
pip install -r app/requirements.txt

# Restart service
sudo systemctl restart hotel-backend

echo "✅ Python 3.11 upgrade completed!"
python3.11 --version
