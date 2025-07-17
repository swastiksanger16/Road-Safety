from sqlmodel import SQLModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional


class UserLocation(SQLModel, table=True):
    __tablename__ = "user_location"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id")
    lat: float
    lng: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class UserCurrentLocation(SQLModel, table=True):
    __tablename__ = "user_current_location"
    
    user_id: UUID = Field(primary_key=True, foreign_key="users.id")
    lat: float
    lng: float
    updated_at: datetime = Field(default_factory=datetime.utcnow)
