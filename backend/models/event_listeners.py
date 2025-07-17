from sqlalchemy import event
from sqlalchemy.orm import mapper
from models.hazard import Hazard
from datetime import datetime

@event.listens_for(Hazard, "before_update", propagate=True)
def receive_before_update(mapper, connection, target):
    target.updated_at = datetime.utcnow()
