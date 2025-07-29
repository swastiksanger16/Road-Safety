from datetime import datetime
from sqlmodel import Session, select
from models.location import UserCurrentLocation
from schemas.location import UserCurrentLocationUpdate
from math import radians, cos, sin, asin, sqrt

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371
    d_lat = radians(lat2 - lat1)
    d_lon = radians(lon2 - lon1)
    a = sin(d_lat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon / 2)**2
    return 2 * R * asin(sqrt(a))

def upsert_user_location(session: Session, data: UserCurrentLocationUpdate):
    loc = session.get(UserCurrentLocation, data.user_id)
    if loc:
        loc.lat = data.lat
        loc.lng = data.lng
        loc.updated_at = datetime.utcnow()
    else:
        loc = UserCurrentLocation(user_id=data.user_id, lat=data.lat, lng=data.lng)
        session.add(loc)
    session.commit()
    session.refresh(loc)
    return loc

def get_user_location(session: Session, user_id):
    return session.get(UserCurrentLocation, user_id)

def get_users_near_location(session: Session, lat: float, lng: float, radius_km: float = 2):
    locations = session.exec(select(UserCurrentLocation)).all()
    return [
        loc for loc in locations
        if haversine_distance(lat, lng, loc.lat, loc.lng) <= radius_km
    ]
