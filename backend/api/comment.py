from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List

from db.session import get_session
from core.deps import get_current_user
from models.users import Users
from schemas.comment import CommentCreate, CommentResponse
from services.comment_service import create_comment, get_comments_by_report

router = APIRouter()

@router.post("/", response_model=CommentResponse)
def add_comment(
    comment_data: CommentCreate,
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user)
):
    return create_comment(session, current_user.id, comment_data)


@router.get("/{report_id}", response_model=List[CommentResponse])
def fetch_comments(
    report_id: int,
    session: Session = Depends(get_session)
):
    comments = get_comments_by_report(session, report_id)
    if not comments:
        raise HTTPException(status_code=404, detail="No comments found")
    return comments
