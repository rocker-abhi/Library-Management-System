#!/bin/bash
# Exit on error
set -e

echo "============================================="
echo "🚀 HRMS & Library System - Bootstrapper"
echo "============================================="

echo "🐳 Setting Docker context to 'default'..."
docker context use default

echo "⚡ Checking and freeing up system ports..."
python3 free_ports.py

echo "🏗️ Building and starting container stack..."
docker compose up --build -d

echo "✅ Stack is up! Run './seed.sh' to setup database schema & seed data if this is the first run."
echo "============================================="
