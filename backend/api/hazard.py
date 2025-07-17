from fastapi import APIRouter, Depends
from sqlmodel import Session
from db.session import get_session
from schemas.hazard import HazardCreate, HazardRead
from services.hazard_service import create_hazard

router = APIRouter()

@router.post("/", response_model=HazardRead)
def report_hazard(hazard: HazardCreate, session: Session = Depends(get_session)):
    return create_hazard(hazard, session)
