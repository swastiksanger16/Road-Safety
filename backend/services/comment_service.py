from sqlmodel import Session, select
from uuid import UUID
from fastapi import HTTPException
from models.comment import Comment
from schemas.comment import CommentCreate
from typing import List
from sqlalchemy.orm import selectinload


def create_comment(session: Session, user_id: UUID, comment_data: CommentCreate) -> Comment:
    new_comment = Comment(
        report_id=comment_data.report_id,
        user_id=user_id,
        text=comment_data.text
    )
    session.add(new_comment)
    session.commit()
    session.refresh(new_comment)
    return new_comment


def get_comments_by_report(session: Session, report_id: int):
    statement = (
        select(Comment)
        .where(Comment.report_id == report_id)
        .options(selectinload(Comment.user))  
        .order_by(Comment.created_at.desc())
    )
    return session.exec(statement).all()
