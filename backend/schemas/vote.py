from pydantic import BaseModel
from uuid import UUID


class VoteCreate(BaseModel):
    report_id: int
    vote_type: str  # 'upvote' or 'downvote'


class VoteResponse(BaseModel):
    id: int
    user_id: UUID
    report_id: int
    vote_type: str

    class Config:
        orm_mode = True 
