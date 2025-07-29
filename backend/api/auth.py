from fastapi import APIRouter, Depends
from sqlmodel import Session
from schemas.users import UserCreate, TokenWithUser, UserOut
from services.auth_service import register_user, authenticate_user
from db.session import get_session
from fastapi.security import OAuth2PasswordRequestForm
from core.deps import get_current_user

router = APIRouter()

@router.post("/signup", response_model=TokenWithUser)
def signup(user: UserCreate, session: Session = Depends(get_session)):
    return register_user(session, user)

@router.post("/login", response_model=TokenWithUser)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    return authenticate_user(session, form_data)

@router.get("/validate-token", response_model=UserOut)
def validate_token(current_user: UserOut = Depends(get_current_user)):
    return current_user
