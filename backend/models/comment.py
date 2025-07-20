from sqlmodel import SQLModel, Field
from uuid import UUID
from typing import Optional
from datetime import datetime


class Comment(SQLModel, table=True):
    __tablename__ = "comments"

    id: Optional[int] = Field(default=None, primary_key=True)
    report_id: int = Field(foreign_key="hazard.id")
    user_id: UUID = Field(foreign_key="users.id")
    text: str = Field(max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)
