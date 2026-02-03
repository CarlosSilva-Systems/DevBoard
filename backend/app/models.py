from sqlalchemy import ForeignKey, Integer, String, DateTime, Float, Boolean, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from .database import Base
import uuid
import datetime
from typing import Optional, List

# Helper for UTC now
def utc_now():
    return datetime.datetime.utcnow()

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships will be added in future commits to avoid errors refers to non-existent classes if strict
    # But for "User", it refers to Client/Project/RateSettings. 
    # If I define them here as string forward refs, SQLAlchemy should be fine as long as I don't instantiate?
    # Actually, best to comment them out or include them in the file but as "pass" classes? 
    # No, cleaner to strictly split. I will comment relationship lines for now.
    # clients: Mapped[List["Client"]] = relationship("Client", back_populates="user")
    # projects: Mapped[List["Project"]] = relationship("Project", back_populates="user")
    # rate_settings: Mapped[Optional["RateSettings"]] = relationship("RateSettings", back_populates="user", uselist=False)
