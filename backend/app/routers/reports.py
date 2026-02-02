from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Dict, Any

from ..database import get_db
from ..models import User, TimeEntry, Task, RateSettings, Project
from .auth import get_current_user

router = APIRouter()

@router.get("/reports/weekly")
async def weekly_report(week_start: datetime, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Calculate end of week (Sunday)
    week_end = week_start + timedelta(days=6, hours=23, minutes=59, seconds=59)
    
    # Get user base rate
    rate_res = await db.execute(select(RateSettings).where(RateSettings.user_id == current_user.id))
    rate_settings = rate_res.scalars().first()
    base_rate = rate_settings.base_hourly_rate if rate_settings else 0.0

    # Query time entries in range
    # Since manual entries use start_at as date ref, we check start_at >= week_start and start_at <= week_end
    # For active timer (end_at=None), we might exclude or calculate partial? For reports, usually exclude or count up to now. 
    # Let's count only finished or manual entries for simplicity (end_at != null or mode=manual)
    
    # Join Task -> Board -> Project to get project info and override rates
    # Note: Task -> Board -> Project chain
    # We load project eagerly or join explicitly
    
    query = (
        select(TimeEntry, Task, Project)
        .join(Task, TimeEntry.task_id == Task.id)
        .join(Project, Task.board_id == Project.project_id) # Using Task.board_id to get Board, then Project
        # Wait, Task has board_id. Board has project_id. 
        # Need to join Board first.
    )
    
    # Correct Join: TimeEntry -> Task -> Column -> Board -> Project
    # OR TimeEntry -> Task -> Board -> Project (if using board_id on Task)
    # Our model has Task.board_id (loose).
    
    result = await db.execute(
        select(TimeEntry, Task, Project)
        .join(Task, TimeEntry.task_id == Task.id)
        # We need Board to bridge to Project if Task.project_id doesn't exist (it doesn't)
        # But we can join Project directly if we had FK. We don't.
        # We need to join Board.
        # However, in implicit joins, SQLAlchemy might struggle if paths are ambiguous.
        # Let's do explicit:
        # TimeEntry -> Task
        # Task -> Board (via board_id) or Task -> Column -> Board
        # Task has board_id nullable. If null, use column -> board.
        # MVP: Assume board_id is populated on Task (we set it in create_task).
    )

    # Let's try a simpler fetch and process in python for MVP to avoid complex joins issues with async
    # Fetch all entries for user in range
    entries_res = await db.execute(
        select(TimeEntry).where(
            TimeEntry.user_id == current_user.id,
            TimeEntry.start_at >= week_start,
            TimeEntry.start_at <= week_end
        )
    )
    entries = entries_res.scalars().all()
    
    total_seconds = 0
    billable_seconds = 0
    total_value = 0.0
    
    breakdown_project = {}
    breakdown_type = {}
    
    for entry in entries:
        # Calculate duration
        duration = float(entry.duration_seconds)
        
        # We need task and project info.
        # Ideally we eager load this.
        # Let's refetch with selectinload for performance or just lazy load (async requires explicit load)
        pass # Optimization needed.

    # Better approach: Main query with joins
    stmt = (
        select(TimeEntry, Task, Project)
        .join(Task, TimeEntry.task_id == Task.id)
        .join(Project, Task.board_id == Project.id) # Assuming Task.board_id actually links to Project if we cheat? No, Task.board_id links to Board.
        # We need to join Board properly.
        # But `Task` has `board_id` FK to `boards.id`. `Board` has `project_id`.
    )
    
    # Re-writing query properly
    from ..models import Board
    stmt = (
        select(TimeEntry, Task, Board, Project)
        .join(Task, TimeEntry.task_id == Task.id)
        .join(Board, Task.board_id == Board.id)
        .join(Project, Board.project_id == Project.id)
        .where(
            TimeEntry.user_id == current_user.id,
            TimeEntry.start_at >= week_start,
            TimeEntry.start_at <= week_end
        )
    )
    
    result = await db.execute(stmt)
    rows = result.all()
    
    for row in rows:
        entry: TimeEntry = row[0]
        task: Task = row[1]
        project: Project = row[3] # Board is 2
        
        duration = entry.duration_seconds
        total_seconds += duration
        
        # Rate calc
        rate = project.hourly_rate_override if project.hourly_rate_override is not None else base_rate
        
        if entry.billable:
            billable_seconds += duration
            # Value = hours * rate
            total_value += (duration / 3600.0) * rate

        # Breakdowns
        p_name = project.name
        breakdown_project[p_name] = breakdown_project.get(p_name, 0) + duration
        
        t_type = task.type or "other"
        breakdown_type[t_type] = breakdown_type.get(t_type, 0) + duration

    total_hours = total_seconds / 3600.0
    billable_hours = billable_seconds / 3600.0
    effective_rate_overall = total_value / total_hours if total_hours > 0 else 0
    effective_rate_billable = total_value / billable_hours if billable_hours > 0 else 0
    
    return {
        "week_start": week_start,
        "week_end": week_end,
        "total_hours": round(total_hours, 2),
        "billable_hours": round(billable_hours, 2),
        "total_value": round(total_value, 2),
        "effective_rate_overall": round(effective_rate_overall, 2),
        "effective_rate_billable": round(effective_rate_billable, 2),
        "breakdown_project": breakdown_project,
        "breakdown_type": breakdown_type
    }
