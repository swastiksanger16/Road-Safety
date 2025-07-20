from sqlmodel import SQLModel, Field
from uuid import UUID
from typing import Optional
from datetime import datetime


class Vote(SQLModel, table=True):
    __tablename__ = "votes"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id")
    report_id: int = Field(foreign_key="hazard.id")
    vote_type: str = Field(max_length=20)  # 'upvote' or 'downvote'
    created_at: datetime = Field(default_factory=datetime.utcnow)
