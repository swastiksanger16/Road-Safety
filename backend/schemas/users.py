from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional

# ----- Shared fields for all user schemas -----
class UserBase(BaseModel):
    name: str
    email: EmailStr

# ----- Schema for creating a new user -----
class UserCreate(UserBase):
    password: str  # plain password input from frontend

# ----- Schema for reading user data (e.g., in profile, admin dashboard) -----
class UserRead(UserBase):
    id: UUID
    role: str
    created_at: datetime

    class Config:
        orm_mode = True

# ----- Schema for login -----
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str