from sqlmodel import Session, select
from schemas.users import UserCreate
from models.users import Users
from core.security import get_password_hash, create_access_token, verify_password
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

def register_user(session: Session, user_data: UserCreate):
    existing = session.exec(select(Users).where(Users.email == user_data.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed = get_password_hash(user_data.password)
    user = Users(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

def authenticate_user(session: Session, form_data: OAuth2PasswordRequestForm):
    print("📥 Username:", form_data.username)
    print("📥 Password:", form_data.password)

    user = session.exec(select(Users).where(Users.email == form_data.username)).first()
    if not user:
        print("❌ No user found with this email")
    else:
        print("✅ User found:", user.email)

    if not user or not verify_password(form_data.password, user.password_hash):
        print("❌ Invalid password")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

