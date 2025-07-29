from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db.session import get_session
from models.vote import Vote
from core.deps import get_current_user
from models.users import Users
from datetime import datetime

router = APIRouter()


@router.post("/")
def cast_vote(report_id: int, vote_type: str, session: Session = Depends(get_session), user: Users = Depends(get_current_user)):
    if vote_type not in ["upvote", "downvote"]:
        raise HTTPException(status_code=400, detail="Invalid vote type")

    # Check if user has already voted on this report
    existing_vote = session.exec(
        select(Vote).where(Vote.user_id == user.id, Vote.report_id == report_id)
    ).first()

    if existing_vote:
        if existing_vote.vote_type == vote_type:
            # Unvoting
            session.delete(existing_vote)
            session.commit()
            return {"message": "Vote removed"}
        else:
            # Changing vote
            existing_vote.vote_type = vote_type
            existing_vote.created_at = datetime.utcnow()
            session.add(existing_vote)
            session.commit()
            return {"message": "Vote updated"}
    else:
        # New vote
        new_vote = Vote(user_id=user.id, report_id=report_id, vote_type=vote_type)
        session.add(new_vote)
        session.commit()
        return {"message": "Vote cast"}
