import sys
import asyncio
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, clients_projects, kanban, time_entries, reports
from .config import settings
from .database import get_db

app = FastAPI(title="DevBoard BI API")

# CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(clients_projects.router, prefix="/api", tags=["Clients & Projects"])
app.include_router(kanban.router, prefix="/api", tags=["Kanban"])
app.include_router(time_entries.router, prefix="/api", tags=["Time Tracking"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])

@app.get("/seed")
async def seed_data(db=Depends(get_db)):
    from app.models import User, Client, Project, Board, Column
    from app.auth_utils import get_password_hash
    from sqlalchemy.future import select
    
    # Check if user exists
    result = await db.execute(select(User).where(User.email == "admin@example.com"))
    if result.scalars().first():
        return {"message": "User already exists"}

    # Create User
    user = User(
        email="admin@example.com",
        name="Admin User",
        password_hash=get_password_hash("password123")
    )
    db.add(user)
    await db.flush()

    # Create Client
    client = Client(name="Acme Corp", user_id=user.id)
    db.add(client)
    await db.flush()

    # Create Project
    project = Project(name="Website Redesign", client_id=client.id, user_id=user.id, hourly_rate_override=50.0)
    db.add(project)
    await db.flush()
    
    # Create Board
    board = Board(name="Kanban Board", project_id=project.id)
    db.add(board)
    await db.flush()
    
    # Create Columns
    cols = ["Backlog", "Doing", "Review", "Done"]
    for i, name in enumerate(cols):
        db.add(Column(name=name, position=i, board_id=board.id))
        
    await db.commit()
    return {"message": "Seed complete"}

@app.get("/")
def read_root():
    return {"message": "Welcome to DevBoard BI API"}
