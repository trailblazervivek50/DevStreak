from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.schemas.streak import StreakResponse
from app.services.streak_service import get_streak
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/streak", tags=["streak"])

@router.get("", response_model=StreakResponse)
async def read_streak(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await get_streak(db, current_user.id)
