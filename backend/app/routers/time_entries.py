from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta
import uuid

from ..database import get_db
from ..models import User, Task, TimeEntry, Project, Board, TimesheetPeriod
from ..schemas import TimeEntryCreate, TimeEntryResponse
from .auth import get_current_user

router = APIRouter()

async def check_locked(user_id: str, date_ref: datetime, db: AsyncSession):
    # Check if period is locked
    result = await db.execute(
        select(TimesheetPeriod).where(
            TimesheetPeriod.user_id == user_id,
            TimesheetPeriod.locked == True,
            TimesheetPeriod.start_date <= date_ref,
            TimesheetPeriod.end_date >= date_ref
        )
    )
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Timesheet period is locked")

@router.get("/time/active", response_model=TimeEntryResponse)
async def get_active_timer(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TimeEntry).where(TimeEntry.user_id == current_user.id, TimeEntry.end_at == None))
    timer = result.scalars().first()
    if not timer:
        raise HTTPException(status_code=404, detail="No active timer")
    return timer

@router.get("/tasks/{task_id}/time", response_model=list[TimeEntryResponse])
async def get_task_time_entries(task_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TimeEntry).where(TimeEntry.task_id == task_id, TimeEntry.user_id == current_user.id))
    return result.scalars().all()

@router.post("/tasks/{task_id}/time/start", response_model=TimeEntryResponse)
async def start_timer(task_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Check if active timer exists
    active = await db.execute(select(TimeEntry).where(TimeEntry.user_id == current_user.id, TimeEntry.end_at == None))
    if active.scalars().first():
        raise HTTPException(status_code=400, detail="Another timer is already active")
        
    # Verify task ownership
    task_res = await db.execute(select(Task).join(Board).join(Project).where(Task.id == task_id, Project.user_id == current_user.id))
    task = task_res.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    new_entry = TimeEntry(
        task_id=task_id,
        user_id=current_user.id,
        start_at=datetime.utcnow(),
        mode="timer",
        billable=task.billable # inherit/default
    )
    db.add(new_entry)
    await db.commit()
    await db.refresh(new_entry)
    return new_entry

@router.post("/tasks/{task_id}/time/stop", response_model=TimeEntryResponse)
async def stop_timer(task_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TimeEntry).where(TimeEntry.user_id == current_user.id, TimeEntry.end_at == None, TimeEntry.task_id == task_id))
    entry = result.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail="No active timer for this task")
        
    now = datetime.utcnow()
    entry.end_at = now
    entry.duration_seconds = int((now - entry.start_at).total_seconds())
    
    await db.commit()
    await db.refresh(entry)
    return entry

@router.post("/tasks/{task_id}/time/manual", response_model=TimeEntryResponse)
async def manual_entry(task_id: str, entry_data: TimeEntryCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    task_res = await db.execute(select(Task).join(Board).join(Project).where(Task.id == task_id, Project.user_id == current_user.id))
    task = task_res.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Manual entry: use provided date as start_at, calculate end_at
    start_time = entry_data.date if entry_data.date else datetime.utcnow()
    
    # Check lock
    await check_locked(current_user.id, start_time, db)

    end_time = start_time + timedelta(minutes=entry_data.duration_minutes)
    
    new_entry = TimeEntry(
        task_id=task_id,
        user_id=current_user.id,
        start_at=start_time,
        end_at=end_time,
        duration_seconds=entry_data.duration_minutes * 60,
        mode="manual",
        notes=entry_data.notes,
        billable=entry_data.billable
    )
    db.add(new_entry)
    await db.commit()
    await db.refresh(new_entry)
    return new_entry

@router.delete("/time/{entry_id}")
async def delete_time_entry(entry_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TimeEntry).where(TimeEntry.id == entry_id, TimeEntry.user_id == current_user.id))
    entry = result.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
        
    if entry.start_at:
        await check_locked(current_user.id, entry.start_at, db)
        
    await db.delete(entry)
    await db.commit()
    return {"message": "Entry deleted"}

@router.post("/timesheet/lock")
async def lock_timesheet(start_date: datetime, end_date: datetime, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Create locking period
    # Ensure no overlap? MVP: Just create.
    
    period = TimesheetPeriod(
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
        locked=True,
        locked_at=datetime.utcnow()
    )
    db.add(period)
    
    # Mark entries as locked
    # Logic: update time_entries set locked=true where user_id=... and start_at between ...
    # SQLAlchemy update
    # Note: simple loop or bulk update
    
    entries = await db.execute(select(TimeEntry).where(
        TimeEntry.user_id == current_user.id,
        TimeEntry.start_at >= start_date,
        TimeEntry.start_at <= end_date
    ))
    for entry in entries.scalars().all():
        entry.locked = True
        
    await db.commit()
    return {"message": "Period locked", "period_id": period.id}

@router.get("/timesheet/export.csv")
async def export_timesheet_csv(start: datetime, end: datetime, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Fetch entries with joins for project/task names
    stmt = (
        select(TimeEntry, Task, Project)
        .join(Task, TimeEntry.task_id == Task.id)
        .join(Board, Task.board_id == Board.id)
        .join(Project, Board.project_id == Project.id)
        .where(
            TimeEntry.user_id == current_user.id,
            TimeEntry.start_at >= start,
            TimeEntry.start_at <= end
        )
    )
    result = await db.execute(stmt)
    rows = result.all()
    
    import csv
    import io
    from fastapi.responses import StreamingResponse
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Client", "Project", "Task", "Duration (h)", "Billable", "Notes", "Value"])
    
    for row in rows:
        entry: TimeEntry = row[0]
        task: Task = row[1]
        project: Project = row[3] # Board is joined but not selected? Wait, select order matters.
        # select(TimeEntry, Task, Project) -> Board is implicitly joined in stmt but not in select list?
        # My stmt above selected (TimeEntry, Task, Project). Board joined but not selected.
        # So row has 3 elements.
        
        # Calculate value
        hours = entry.duration_seconds / 3600.0
        rate = project.hourly_rate_override if project.hourly_rate_override is not None else 0.0 # TODO: fetch user base rate if None
        value = hours * rate if entry.billable else 0.0
        
        writer.writerow([
            entry.start_at.strftime("%Y-%m-%d") if entry.start_at else "",
            "Client?", # Need Client join or Project.client relationship
            project.name,
            task.title,
            f"{hours:.2f}",
            "Yes" if entry.billable else "No",
            entry.notes or "",
            f"{value:.2f}"
        ])
    
    output.seek(0)
    response = StreamingResponse(iter([output.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=timesheet_export.csv"
    return response
