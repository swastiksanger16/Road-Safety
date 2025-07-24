from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.auth import router as auth_router
from api.users import router as user_router
from api.hazard import router as hazard_router
from api.comment import router as comment_router
from api.files import router as files_router

app = FastAPI()

origins = [
    "http://localhost:5173", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(user_router, prefix="/api/users", tags=["Users"])
app.include_router(hazard_router, prefix="/api/hazards", tags=["Hazards"])
app.include_router(comment_router, prefix="/api/comments", tags=["Comments"])
app.include_router(files_router, prefix="/api/files", tags=["Files"])
