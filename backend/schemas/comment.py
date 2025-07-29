from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class CommentCreate(BaseModel):
    report_id: int
    text: str

class CommentUser(BaseModel):
    id: UUID
    name: str

    class Config:
        orm_mode = True

class CommentResponse(BaseModel):
    id: int
    report_id: int
    user: CommentUser  
    user_name: str
    text: str
    created_at: datetime

    class Config:
        orm_mode = True


class CommentWithUserResponse(BaseModel):
    id: int
    report_id: int
    user_id: UUID
    text: str
    created_at: datetime
    user_name: str 

    class Config:
        orm_mode = True
