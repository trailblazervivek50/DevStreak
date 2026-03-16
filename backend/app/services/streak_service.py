from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from app.models.streak import Streak
from app.models.completion import TaskCompletion
from app.services.task_service import get_task

async def get_or_create_streak(db: AsyncSession, user_id: int):
    result = await db.execute(select(Streak).filter(Streak.user_id == user_id))
    streak = result.scalars().first()
    if not streak:
        streak = Streak(user_id=user_id)
        db.add(streak)
        await db.commit()
        await db.refresh(streak)
    return streak

async def complete_task(db: AsyncSession, task_id: int, user_id: int):
    # Verify task exists and belongs to user
    await get_task(db, task_id, user_id)
    
    today = date.today()
    
    # Check if already completed today
    result = await db.execute(
        select(TaskCompletion).filter(
            TaskCompletion.task_id == task_id,
            TaskCompletion.user_id == user_id,
            TaskCompletion.completed_date == today
        )
    )
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Task already completed today")
    
    # Record completion
    completion = TaskCompletion(task_id=task_id, user_id=user_id, completed_date=today)
    db.add(completion)
    
    # Update streak
    streak = await get_or_create_streak(db, user_id)
    
    if streak.last_completed_date == today:
        # Already updated streak today
        pass
    elif streak.last_completed_date == today - timedelta(days=1):
        # Consecutive day
        streak.current_streak += 1
        streak.last_completed_date = today
        if streak.current_streak > streak.longest_streak:
            streak.longest_streak = streak.current_streak
    else:
        # Missed a day or first time
        streak.current_streak = 1
        streak.last_completed_date = today
        if streak.longest_streak == 0:
            streak.longest_streak = 1
            
    await db.commit()
    return {"message": "Task completed successfully"}

async def get_streak(db: AsyncSession, user_id: int):
    streak = await get_or_create_streak(db, user_id)
    
    # Check if streak is broken
    today = date.today()
    if streak.last_completed_date and streak.last_completed_date < today - timedelta(days=1):
        streak.current_streak = 0
        await db.commit()
        await db.refresh(streak)
        
    return streak
