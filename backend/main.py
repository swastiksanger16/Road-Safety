from fastapi import FastAPI
from sqlmodel import SQLModel
from db.session import engine
from api import auth
from api import users, hazard
from models import event_listeners

app = FastAPI()

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(hazard.router, prefix="/api/hazards", tags=["Hazards"])
