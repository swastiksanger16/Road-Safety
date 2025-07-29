from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID
from typing import Optional, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from models.users import Users

class Comment(SQLModel, table=True):
    __tablename__ = "comments"

    id: Optional[int] = Field(default=None, primary_key=True)
    report_id: int = Field(foreign_key="hazard.id")
    user_id: UUID = Field(foreign_key="users.id")
    text: str = Field(max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: Optional["Users"] = Relationship(back_populates="comments")
