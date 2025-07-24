from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.users import Users
from db.session import get_session
from core.deps import get_current_user
from schemas.users import UserOut

router = APIRouter()

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: Users = Depends(get_current_user)):
    return current_user