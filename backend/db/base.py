# db/base.py

from models.users import Users
from models.hazard import Hazard
from models.location import UserLocation, UserCurrentLocation

# Optional: force import to register all models for SQLModel.metadata
all_models = [Users, Hazard, UserLocation, UserCurrentLocation]
