from sqlmodel import SQLModel, Field
from uuid import UUID
from typing import Optional
from datetime import datetime


class Hazard(SQLModel, table=True):
    __tablename__ = "hazard"

    id: Optional[int] = Field(default=None, primary_key=True)
    lat: float = Field(index=True)
    lng: float = Field(index=True)
    hazard_type: str = Field(max_length=50, index=True)
    description: Optional[str] = Field(default=None, max_length=500)
    photo_url: str = Field(max_length=2048)  # Required
    status: str = Field(default="unresolved", max_length=50, index=True)
    source: str = Field(default="user", max_length=50)
    reported_by: UUID = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
