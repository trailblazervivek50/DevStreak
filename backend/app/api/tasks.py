from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.services.task_service import create_task, get_tasks, update_task, delete_task
from app.services.streak_service import complete_task
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("", response_model=TaskResponse)
async def create_new_task(task: TaskCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await create_task(db, task, current_user.id)

@router.get("", response_model=List[TaskResponse])
async def read_tasks(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await get_tasks(db, current_user.id)

@router.put("/{task_id}", response_model=TaskResponse)
async def update_existing_task(task_id: int, task: TaskUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await update_task(db, task_id, task, current_user.id)

@router.delete("/{task_id}")
async def delete_existing_task(task_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await delete_task(db, task_id, current_user.id)

@router.post("/{task_id}/complete")
async def mark_task_complete(task_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await complete_task(db, task_id, current_user.id)
