from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from db.session import get_session
from core.deps import get_current_user
from models.users import Users
from schemas.location import (
    UserCurrentLocationUpdate,
    UserCurrentLocationRead,
    UsersNearbyRead
)
from services.location_service import (
    upsert_user_location,
    get_user_location,
    get_users_near_location,
    haversine_distance
)
from typing import List

router = APIRouter()

@router.post("/update", response_model=UserCurrentLocationRead)
def update_location(
    data: UserCurrentLocationUpdate,
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user)
):
    if data.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot update another user's location")
    return upsert_user_location(session, data)

@router.get("/me", response_model=UserCurrentLocationRead)
def my_location(
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user)
):
    location = get_user_location(session, current_user.id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return location

@router.get("/users-nearby", response_model=List[UsersNearbyRead])
def users_nearby(
    lat: float,
    lng: float,
    radius_km: float = 2,
    session: Session = Depends(get_session),
    current_user: Users = Depends(get_current_user)
):
    locations = get_users_near_location(session, lat, lng, radius_km)
    return [
        UsersNearbyRead(
            user_id=loc.user_id,
            lat=loc.lat,
            lng=loc.lng,
            updated_at=loc.updated_at,
            distance_km=haversine_distance(lat, lng, loc.lat, loc.lng)
        )
        for loc in locations
    ]
