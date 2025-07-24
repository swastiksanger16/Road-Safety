from sqlmodel import Session
from models.hazard import Hazard
from uuid import UUID
from datetime import datetime

def create_hazard(
    lat: float,
    lng: float,
    hazard_type: str,
    description: str,
    photo_url: str,
    user_id: UUID,
    session: Session
) -> Hazard:
    hazard = Hazard(
        lat=lat,
        lng=lng,
        hazard_type=hazard_type,
        description=description,
        photo_url=photo_url,
        reported_by=user_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    session.add(hazard)
    session.commit()
    session.refresh(hazard)
    return hazard
