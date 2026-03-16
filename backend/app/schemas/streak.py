from pydantic import BaseModel
from datetime import date
from typing import Optional

class StreakResponse(BaseModel):
    user_id: int
    current_streak: int
    longest_streak: int
    last_completed_date: Optional[date]

    class Config:
        from_attributes = True
