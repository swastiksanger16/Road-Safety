from pydantic import BaseModel
from datetime import datetime


class ForwardedReportCreate(BaseModel):
    report_id: int
    authority: str


class ForwardedReportResponse(BaseModel):
    id: int
    report_id: int
    authority: str
    forwarded_at: datetime

    class Config:
        orm_mode = True
