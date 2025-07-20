from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class CommentCreate(BaseModel):
    report_id: int
    text: str


class CommentResponse(BaseModel):
    id: int
    report_id: int
    user_id: UUID
    text: str
    created_at: datetime

    class Config:
        orm_mode = True
