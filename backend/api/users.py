from fastapi import APIRouter, Depends
from sqlmodel import Session
from db.session import get_session
from schemas.users import UserCreate, UserRead
from services.users_service import create_user  # optional service layer

router = APIRouter()

@router.post("/", response_model=UserRead)
def register_user(user: UserCreate, session: Session = Depends(get_session)):
    return create_user(user, session)
