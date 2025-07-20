from sqlmodel import Session, select
from uuid import UUID
from models.vote import Vote
from schemas.vote import VoteCreate


def create_or_toggle_vote(session: Session, user_id: UUID, vote_data: VoteCreate) -> str:
    existing_vote = session.exec(
        select(Vote).where(
            Vote.user_id == user_id,
            Vote.report_id == vote_data.report_id
        )
    ).first()

    if existing_vote:
        if existing_vote.vote_type == vote_data.vote_type:
            session.delete(existing_vote)
            session.commit()
            return "Vote removed"
        else:
            existing_vote.vote_type = vote_data.vote_type
            session.add(existing_vote)
            session.commit()
            return "Vote updated"
    else:
        new_vote = Vote(user_id=user_id, **vote_data.dict())
        session.add(new_vote)
        session.commit()
        session.refresh(new_vote)
        return "Vote created"
