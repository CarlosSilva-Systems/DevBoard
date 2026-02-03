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
