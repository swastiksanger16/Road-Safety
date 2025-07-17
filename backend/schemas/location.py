from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class UserLocationBase(BaseModel):
    lat: float
    lng: float

class UserLocationCreate(UserLocationBase):
    user_id: UUID

class UserLocationRead(UserLocationBase):
    id: int
    user_id: UUID
    timestamp: datetime

    class Config:
        orm_mode = True

class UserCurrentLocationBase(BaseModel):
    lat: float
    lng: float

class UserCurrentLocationUpdate(UserCurrentLocationBase):
    user_id: UUID

class UserCurrentLocationRead(UserCurrentLocationBase):
    user_id: UUID
    updated_at: datetime

    class Config:
        orm_mode = True
