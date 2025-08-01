from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Path, BackgroundTasks, status
from sqlmodel import Session, select
from typing import List
from core.notification_service import send_hazard_email
from db.session import get_session
from services.hazard_service import create_hazard
from services.location_service import upsert_user_location, get_users_near_location, haversine_distance
from core.deps import get_current_user, get_current_admin
from core.s3_service import upload_to_s3, get_presigned_url
from models.hazard import Hazard
from models.users import Users
from schemas.hazard import HazardRead, HazardStatusUpdate
from schemas.location import UserCurrentLocationUpdate
import os
from fastapi.responses import JSONResponse
from core.ml_model import is_pothole

router = APIRouter()


@router.post("/", response_model=HazardRead)
async def report_hazard(
    background_tasks: BackgroundTasks,
    lat: float = Form(...),
    lng: float = Form(...),
    hazard_type: str = Form(...),
    description: str = Form(""),
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user)
):
    # ✅ Read image bytes for ML check
    image_bytes = await file.read()

    # ✅ ML check only for pothole type
    if hazard_type.lower() == "pothole" and not is_pothole(image_bytes):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST , # ✅ keep 200 so frontend doesn't treat as hard error
            content={
                "success": False,
                "message": "Uploaded image is not a valid hazard. Please try again."
            }
        )
    # ✅ Reset file pointer so S3 can read it
    file.file.seek(0)

    # ✅ Upload to S3
    s3_key = upload_to_s3(file)

    # ✅ Create hazard entry
    hazard = create_hazard(
        lat=lat,
        lng=lng,
        hazard_type=hazard_type,
        description=description,
        photo_url=s3_key,
        user_id=current_user.id,
        session=session
    )

    # ✅ Update user location
    upsert_user_location(
        session,
        UserCurrentLocationUpdate(
            user_id=current_user.id,
            lat=lat,
            lng=lng
        )
    )

    # ✅ Send notification for accidents
    if hazard_type.lower() == "accident":
        traffic_email = os.getenv("TRAFFIC_AUTH_EMAIL")
        background_tasks.add_task(
            send_hazard_email,
            traffic_email,
            hazard_type,
            f"Lat: {lat}, Lng: {lng}",
            "High",
            "Immediate action required!"
        )

    # ✅ Notify nearby users
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
    radius_km: float = 3,
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
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": "Hazard not found"
            }
        )

    session.delete(hazard)
    session.commit()

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "Hazard deleted successfully"
        }
    )


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

@router.post("/{hazard_id}/upvote")
def send_upvote_email(
    hazard_id: str,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user)
):
    # Find hazard
    hazard = session.get(Hazard, hazard_id)
    if not hazard:
        raise HTTPException(status_code=404, detail="Hazard not found")

    # Get reporter email
    reporter = session.get(Users, hazard.reported_by)
    recipient_email = reporter.email if reporter else os.getenv("ADMIN_EMAIL")

    # Send email only (no DB update)
    background_tasks.add_task(
        send_hazard_email,
        recipient_email,
        hazard.hazard_type,
        f"Lat: {hazard.lat}, Lng: {hazard.lng}",
        "Info",
        f"Someone upvoted your hazard report (ID: {hazard.id})."
    )

    return {"message": "Email sent successfully"}
