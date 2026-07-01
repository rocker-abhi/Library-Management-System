@echo off
echo =============================================
echo 🚀 HRMS & Library System - Bootstrapper (Windows)
echo =============================================

echo 🐳 Setting Docker context to 'default'...
docker context use default

echo ⚡ Checking and freeing up system ports...
python free_ports.py

echo 🏗️ Building and starting container stack...
docker compose up --build -d

echo ✅ Stack is up! Run 'seed.bat' to setup database schema & seed data if this is the first run.
echo =============================================
