from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class HazardBase(BaseModel):
    lat: float
    lng: float
    hazard_type: str
    description: Optional[str] = None
    photo_url: str = None
    status: Optional[str] = "unresolved"
    source: Optional[str] = "user"

class HazardCreate(HazardBase):
    pass

class HazardRead(HazardBase):
    id: int
    reported_by: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class HazardStatusUpdate(BaseModel):
    status: str

# ✅ New schema for feed
class HazardWithVotes(HazardRead):
    upvotes: int
    downvotes: int
    userVote: Optional[str] = None
