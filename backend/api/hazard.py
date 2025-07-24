from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlmodel import Session, select
from db.session import get_session
from services.hazard_service import create_hazard
from core.deps import get_current_user
from core.s3_service import upload_to_s3, get_presigned_url
from models.hazard import Hazard
from models.users import Users
from schemas.hazard import HazardRead
from typing import List

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
    # Upload file to S3 and store only its key
    s3_key = upload_to_s3(file)
    
    return create_hazard(
        lat=lat,
        lng=lng,
        hazard_type=hazard_type,
        description=description,
        photo_url=s3_key,  # store S3 key in DB
        user_id=current_user.id,
        session=session
    )

@router.get("/", response_model=List[HazardRead])
def get_hazards(session: Session = Depends(get_session)):
    hazards = session.exec(select(Hazard)).all()
    # Convert S3 keys into presigned URLs before returning
    for hazard in hazards:
        hazard.photo_url = get_presigned_url(hazard.photo_url)
    return hazards
