from fastapi import APIRouter, Depends
from sqlmodel import Session
from schemas.users import UserCreate, Token
from services.auth_service import register_user, authenticate_user
from db.session import get_session
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/signup", response_model=Token)
def signup(user: UserCreate, session: Session = Depends(get_session)):
    return register_user(session, user)

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    return authenticate_user(session, form_data)
