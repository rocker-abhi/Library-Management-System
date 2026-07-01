#!/bin/bash
# Exit on error
set -e

echo "============================================="
echo "🌱 HRMS & Library System - Database Setup"
echo "============================================="

echo "📦 Running Alembic migrations..."
docker compose exec -T auth-service alembic upgrade head
docker compose exec -T book-service alembic upgrade head
docker compose exec -T borrow-service alembic upgrade head

echo "🌱 Seeding permissions and roles..."
docker compose exec -T auth-service python setup/seed_db.py

echo "👑 Creating superuser / administrator user..."
docker compose exec -T auth-service python setup/create_superuser.py

echo "✅ Database migrations and seeding completed successfully!"
echo "============================================="
