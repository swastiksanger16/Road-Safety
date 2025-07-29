from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

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

# New schema for nearby users
class UsersNearbyRead(BaseModel):
    user_id: UUID
    lat: float
    lng: float
    updated_at: datetime
    distance_km: float
    class Config:
        orm_mode = True
