$ErrorActionPreference = "Stop"

Write-Host "Checking Docker status..."
try {
    docker ps -q
}
catch {
    Write-Error "Docker is not running or not accessible! Please start Docker Desktop."
    exit 1
}

Write-Host "Ensuring DB container is up..."
docker compose up -d db
Write-Host "Waiting 15s for Database to initialize..."
Start-Sleep -Seconds 15

Write-Host "Running Alembic Migrations..."
Set-Location backend
# Ensure venv is used
# & ".\venv\Scripts\python" -m alembic revision --autogenerate -m "Initial_schema"
& ".\venv\Scripts\python" -m alembic upgrade head

Write-Host "Database Fixed! You can now restart the backend."
