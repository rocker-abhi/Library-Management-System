@echo off
echo =============================================
echo 🌱 HRMS & Library System - Database Setup (Windows)
echo =============================================

echo 📦 Running Alembic migrations...
docker compose exec -T auth-service alembic upgrade head
docker compose exec -T book-service alembic upgrade head
docker compose exec -T borrow-service alembic upgrade head

echo 🌱 Seeding permissions and roles...
docker compose exec -T auth-service python setup/seed_db.py

echo ✅ Database migrations and seeding completed successfully!
echo =============================================
