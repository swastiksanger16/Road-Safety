from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import List

from db.session import get_session
from core.deps import get_current_user
from models.users import Users
from schemas.comment import CommentCreate, CommentResponse, CommentWithUserResponse
from services.comment_service import create_comment, get_comments_by_report

router = APIRouter()

@router.post("/", response_model=CommentWithUserResponse)
def add_comment(
    comment_data: CommentCreate,
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user)
):
    comment = create_comment(session, current_user.id, comment_data)
    return CommentWithUserResponse(
        id=comment.id,
        report_id=comment.report_id,
        user_id=comment.user_id,
        text=comment.text,
        created_at=comment.created_at,
        user_name=current_user.name
    )



@router.get("/{report_id}", response_model=List[CommentWithUserResponse])
def fetch_comments(report_id: int, session: Session = Depends(get_session)):
    comments = get_comments_by_report(session, report_id)

   
    return [
        CommentWithUserResponse(
            id=comment.id,
            report_id=comment.report_id,
            user_id=comment.user_id,
            text=comment.text,
            created_at=comment.created_at,
            user_name=comment.user.name if comment.user else "Unknown"
        )
        for comment in comments
    ]
