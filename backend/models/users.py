from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime


class Users(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    name: str = Field(max_length=100)
    email: str = Field(index=True, unique=True, max_length=255)
    password_hash: str = Field(max_length=255)
    role: str = Field(default="user", max_length=50)
    created_at: datetime = Field(default_factory=datetime.utcnow)
