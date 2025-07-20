from sqlmodel import Session, select
from uuid import UUID
from fastapi import HTTPException, status
from models.users import Users
from typing import Dict, List


def get_user_profile(session: Session, user_id: UUID) -> Users:
    user = session.get(Users, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def update_user_profile(session: Session, user_id: UUID, data: Dict) -> Users:
    user = session.get(Users, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in data.items():
        if hasattr(user, key) and key not in ("id", "password_hash", "created_at"):
            setattr(user, key, value)

    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def list_users(session: Session) -> List[Users]:
    return session.exec(select(Users)).all()


def delete_user(session: Session, user_id: UUID):
    user = session.get(Users, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    session.delete(user)
    session.commit()
    return {"message": "User deleted successfully"}
