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

    clients: Mapped[List["Client"]] = relationship("Client", back_populates="user")
    projects: Mapped[List["Project"]] = relationship("Project", back_populates="user")
    rate_settings: Mapped[Optional["RateSettings"]] = relationship("RateSettings", back_populates="user", uselist=False)

class Client(Base):
    __tablename__ = "clients"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="clients")
    projects: Mapped[List["Project"]] = relationship("Project", back_populates="client")

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    client_id: Mapped[str] = mapped_column(String(36), ForeignKey("clients.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    currency: Mapped[str] = mapped_column(String, default="BRL")
    hourly_rate_override: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="projects")
    client: Mapped["Client"] = relationship("Client", back_populates="projects")
    boards: Mapped[List["Board"]] = relationship("Board", back_populates="project")

class Board(Base):
    __tablename__ = "boards"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    project: Mapped["Project"] = relationship("Project", back_populates="boards")
    columns: Mapped[List["Column"]] = relationship("Column", back_populates="board", order_by="Column.position")

class Column(Base):
    __tablename__ = "columns"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    board_id: Mapped[str] = mapped_column(String(36), ForeignKey("boards.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0)
    wip_limit: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    board: Mapped["Board"] = relationship("Board", back_populates="columns")
    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="column", order_by="Task.position")

class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    board_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("boards.id"), nullable=True)
    column_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("columns.id"), nullable=True)
    
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    tags: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    priority: Mapped[Optional[str]] = mapped_column(String, default="med")
    type: Mapped[Optional[str]] = mapped_column(String, default="feature")
    complexity: Mapped[Optional[int]] = mapped_column(Integer, default=1)
    estimated_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    billable: Mapped[Optional[bool]] = mapped_column(Boolean, default=True)
    status: Mapped[Optional[str]] = mapped_column(String, default="open")
    position: Mapped[Optional[float]] = mapped_column(Float, default=0.0)
    
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    column: Mapped["Column"] = relationship("Column", back_populates="tasks")
    time_entries: Mapped[List["TimeEntry"]] = relationship("TimeEntry", back_populates="task")

class TimeEntry(Base):
    __tablename__ = "time_entries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    task_id: Mapped[str] = mapped_column(String(36), ForeignKey("tasks.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    
    start_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    mode: Mapped[Optional[str]] = mapped_column(String, default="timer")
    notes: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    billable: Mapped[Optional[bool]] = mapped_column(Boolean, default=True)
    locked: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    task: Mapped["Task"] = relationship("Task", back_populates="time_entries")
    user: Mapped["User"] = relationship("User") 

class RateSettings(Base):
    __tablename__ = "rate_settings"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    base_hourly_rate: Mapped[Optional[float]] = mapped_column(Float, default=0.0)
    internal_cost_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    target_margin_pct: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="rate_settings")

class TimesheetPeriod(Base):
    __tablename__ = "timesheet_periods"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    start_date: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    locked: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    locked_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
