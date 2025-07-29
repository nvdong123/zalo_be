from sqlmodel import Session, select
from app.models.room_utility import RoomUtility
from app.schemas.room_utility import RoomUtilityCreate, RoomUtilityUpdate
from typing import List, Optional

def get_room_utilities(db: Session, skip: int = 0, limit: int = 100) -> List[RoomUtility]:
    return db.exec(select(RoomUtility).offset(skip).limit(limit)).all()

def get_room_utility(db: Session, room_utility_id: int) -> Optional[RoomUtility]:
    return db.get(RoomUtility, room_utility_id)

def create_room_utility(db: Session, obj_in: RoomUtilityCreate) -> RoomUtility:
    db_obj = RoomUtility(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_room_utility(db: Session, db_obj: RoomUtility, obj_in: RoomUtilityUpdate) -> RoomUtility:
    obj_data = obj_in.dict(exclude_unset=True)
    for field, value in obj_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_room_utility(db: Session, room_utility_id: int) -> None:
    db_obj = db.get(RoomUtility, room_utility_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
