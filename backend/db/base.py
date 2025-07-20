from models.users import Users
from models.hazard import Hazard
from models.location import UserLocation, UserCurrentLocation
from models.comment import Comment
from models.vote import Vote
from models.notification import Notification
from models.forwarded_report import ForwardedReport


all_models = [
    Users,
    Hazard,
    UserLocation,
    UserCurrentLocation,
    Comment,
    Vote,
    Notification,
    ForwardedReport
]
