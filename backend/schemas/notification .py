from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class NotificationCreate(BaseModel):
    user_id: UUID
    report_id: int
    type: str  


class NotificationResponse(BaseModel):
    id: int
    user_id: UUID
    report_id: int
    type: str
    status: str
    created_at: datetime

    class Config:
        orm_mode = True
