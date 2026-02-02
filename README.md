# DevBoard BI - MVP

A Kanban-based project management and time tracking tool for freelancers.

## 🚀 Features
- **Kanban Board**: Drag-and-drop tasks with status workflow.
- **Time Tracking**: Start/Stop timers per task or manual entry.
- **Projects & Clients**: Manage rates and organization.
- **Weekly Reports**: View billable hours and financial breakdown.
- **Timesheet Lock**: Lock periods to prevent editing past financial records.

## 🛠️ Stack
- **Backend**: FastAPI, PostgreSQL, SQLAlchemy (Async), Alembic.
- **Frontend**: Next.js 14 (App Router), shadcn/ui, TailwindCSS.
- **DB**: PostgreSQL (via Docker).

## 🏁 Setup Instructions

### 1. Prerequisites
- Docker Desktop installed and running.
- Python 3.10+
- Node.js 18+

### 2. Start Database
```bash
docker-compose up -d
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Install deps
pip install -r requirements.txt
pip install email-validator pandas

# Run Migrations
alembic upgrade head

# Start Server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
API Docs: http://localhost:8000/docs

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
App: http://localhost:3000

## 🧪 Testing
```bash
cd backend
pytest
```
