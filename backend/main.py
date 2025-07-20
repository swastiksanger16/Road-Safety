from fastapi import FastAPI
from sqlmodel import SQLModel
from db.session import engine
# from api import auth
# from api import users, hazard
from models import event_listeners
# from api.users import router as users_router
from api.hazard import router as hazard_router
from api.auth import router as auth_router
from api.comment import router as comment_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
#app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(hazard_router, prefix="/api/hazards", tags=["Hazards"])
app.include_router(comment_router, prefix="/api/comments", tags=["Comments"])

