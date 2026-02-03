from pydantic import BaseModel, EmailStr
from typing import Optional, List, Union
from uuid import UUID
from datetime import datetime

# Token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[UUID] = None

# User
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    class Config:
        from_attributes = True

# Client
class ClientCreate(BaseModel):
    name: str
    notes: Optional[str] = None

class ClientResponse(ClientCreate):
    id: UUID
    class Config:
        from_attributes = True

# Project
class ProjectCreate(BaseModel):
    client_id: UUID
    name: str
    description: Optional[str] = None
    currency: str = "BRL"
    hourly_rate_override: Optional[float] = None

class ProjectResponse(ProjectCreate):
    id: UUID
    class Config:
        from_attributes = True

# Board
class BoardCreate(BaseModel):
    name: str

class BoardResponse(BaseModel):
    id: UUID
    name: str
    created_at: datetime
    class Config:
        from_attributes = True

# Column
class ColumnCreate(BaseModel):
    name: str
    position: Optional[int] = 0
    wip_limit: Optional[int] = None

class ColumnResponse(ColumnCreate):
    id: UUID
    board_id: UUID
    class Config:
        from_attributes = True

# Task
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "med"
    type: Optional[str] = "feature"
    complexity: Optional[int] = 1
    estimated_minutes: Optional[int] = None
    billable: Optional[bool] = True
    status: Optional[str] = "open"
    tags: Optional[str] = None

class TaskMove(BaseModel):
    column_id: UUID
    position: float

class TaskResponse(TaskCreate):
    id: UUID
    board_id: UUID
    column_id: UUID
    position: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True
