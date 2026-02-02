from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import uuid

from ..database import get_db
from ..models import User, Client, Project
from ..schemas import ClientCreate, ClientResponse, ProjectCreate, ProjectResponse
from .auth import get_current_user

router = APIRouter()

# --- Clients ---
@router.post("/clients", response_model=ClientResponse)
async def create_client(client: ClientCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    new_client = Client(**client.dict(), user_id=current_user.id)
    db.add(new_client)
    await db.commit()
    await db.refresh(new_client)
    return new_client

@router.get("/clients", response_model=List[ClientResponse])
async def get_clients(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Client).where(Client.user_id == current_user.id))
    return result.scalars().all()

@router.get("/clients/{client_id}", response_model=ClientResponse)
async def get_client(client_id: uuid.UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Client).where(Client.id == client_id, Client.user_id == current_user.id))
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

# --- Projects ---
@router.post("/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Verify client belongs to user
    result = await db.execute(select(Client).where(Client.id == project.client_id, Client.user_id == current_user.id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Client not found")

    new_project = Project(**project.dict(), user_id=current_user.id)
    db.add(new_project)
    await db.commit()
    await db.refresh(new_project)
    return new_project

@router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.user_id == current_user.id))
    return result.scalars().all()

@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: uuid.UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id, Project.user_id == current_user.id))
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
