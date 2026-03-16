from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate

async def create_task(db: AsyncSession, task: TaskCreate, user_id: int):
    new_task = Task(**task.model_dump(), user_id=user_id)
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task

async def get_tasks(db: AsyncSession, user_id: int):
    result = await db.execute(select(Task).filter(Task.user_id == user_id))
    return result.scalars().all()

async def get_task(db: AsyncSession, task_id: int, user_id: int):
    result = await db.execute(select(Task).filter(Task.id == task_id, Task.user_id == user_id))
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

async def update_task(db: AsyncSession, task_id: int, task_update: TaskUpdate, user_id: int):
    task = await get_task(db, task_id, user_id)
    for key, value in task_update.model_dump().items():
        setattr(task, key, value)
    await db.commit()
    await db.refresh(task)
    return task

async def delete_task(db: AsyncSession, task_id: int, user_id: int):
    task = await get_task(db, task_id, user_id)
    await db.delete(task)
    await db.commit()
    return {"message": "Task deleted successfully"}
