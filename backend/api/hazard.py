from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Path
from sqlmodel import Session, select
from typing import List

from db.session import get_session
from services.hazard_service import create_hazard
from services.location_service import upsert_user_location, get_users_near_location, haversine_distance
from core.deps import get_current_user, get_current_admin
from core.s3_service import upload_to_s3, get_presigned_url
from models.hazard import Hazard
from models.users import Users
from schemas.hazard import HazardRead, HazardStatusUpdate
from schemas.location import UserCurrentLocationUpdate

router = APIRouter()


@router.post("/", response_model=HazardRead)
def report_hazard(
    lat: float = Form(...),
    lng: float = Form(...),
    hazard_type: str = Form(...),
    description: str = Form(""),
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user)
):
    s3_key = upload_to_s3(file)

    hazard = create_hazard(
        lat=lat,
        lng=lng,
        hazard_type=hazard_type,
        description=description,
        photo_url=s3_key,
        user_id=current_user.id,
        session=session
    )

    upsert_user_location(
        session,
        UserCurrentLocationUpdate(
            user_id=current_user.id,
            lat=lat,
            lng=lng
        )
    )

    nearby_users = get_users_near_location(session, lat, lng, radius_km=2)
    print(f"Nearby users for hazard {hazard.id}: {[u.user_id for u in nearby_users]}")

    return hazard


@router.get("/", response_model=List[HazardRead])
def get_hazards(session: Session = Depends(get_session)):
    hazards = session.exec(select(Hazard)).all()
    for hazard in hazards:
        hazard.photo_url = get_presigned_url(hazard.photo_url)
    return hazards


@router.get("/nearby", response_model=List[HazardRead])
def get_nearby_hazards(
    lat: float,
    lng: float,
    radius_km: float = 8,
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user)
):
    hazards = session.exec(select(Hazard)).all()
    nearby_hazards = []

    for hazard in hazards:
        distance = haversine_distance(lat, lng, hazard.lat, hazard.lng)
        if distance <= radius_km:
            hazard.photo_url = get_presigned_url(hazard.photo_url)
            nearby_hazards.append(hazard)

    return nearby_hazards


@router.get("/mine", response_model=List[HazardRead])
def get_my_hazards(
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user)
):
    hazards = session.exec(
        select(Hazard)
        .where(Hazard.reported_by == current_user.id)
        .order_by(Hazard.created_at.desc())
    ).all()

    for h in hazards:
        h.photo_url = get_presigned_url(h.photo_url)

    return hazards


@router.delete("/{hazard_id}")
def delete_hazard(
    hazard_id: str = Path(...),
    session: Session = Depends(get_session),
    current_admin: Users = Depends(get_current_admin)
):
    hazard = session.get(Hazard, hazard_id)
    if not hazard:
        raise HTTPException(status_code=404, detail="Hazard not found")

    session.delete(hazard)
    session.commit()
    return {"detail": "Hazard deleted successfully"}


@router.patch("/{hazard_id}/status", response_model=HazardRead)
def update_hazard_status(
    hazard_id: str,
    payload: HazardStatusUpdate,
    session: Session = Depends(get_session),
    current_admin: Users = Depends(get_current_admin)
):
    hazard = session.get(Hazard, hazard_id)
    if not hazard:
        raise HTTPException(status_code=404, detail="Hazard not found")

    hazard.status = payload.status
    session.add(hazard)
    session.commit()
    session.refresh(hazard)

    hazard.photo_url = get_presigned_url(hazard.photo_url)
    return hazard
