from sqlmodel import SQLModel, Field
from uuid import UUID
from typing import Optional
from datetime import datetime


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id")
    report_id: int = Field(foreign_key="hazard.id")
    type: str = Field(max_length=50)  # 'web_push', 'email', 'sms'
    status: str = Field(default="pending", max_length=50)
    created_at: datetime = Field(default_factory=datetime.utcnow)
