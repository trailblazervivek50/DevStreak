from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, tasks, streak
from app.database.connection import engine, Base

app = FastAPI(title="DevStreak API", description="Backend API for DevStreak productivity app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # In production, use Alembic for migrations
        await conn.run_sync(Base.metadata.create_all)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(streak.router)

@app.get("/")
async def root():
    return {"message": "Welcome to DevStreak API"}
