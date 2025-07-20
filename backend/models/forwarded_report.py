from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class ForwardedReport(SQLModel, table=True):
    __tablename__ = "forwarded_reports"

    id: Optional[int] = Field(default=None, primary_key=True)
    report_id: int = Field(foreign_key="hazard.id")
    authority: str = Field(max_length=255)
    forwarded_at: datetime = Field(default_factory=datetime.utcnow)
