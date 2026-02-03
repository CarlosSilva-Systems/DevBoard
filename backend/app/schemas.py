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
