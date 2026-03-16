from pydantic import BaseModel
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    is_daily: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
