from sqlmodel import Session, select
from app.models.room import Room
from app.schemas.room import RoomCreate, RoomUpdate
from typing import List, Optional

def get_rooms(db: Session, skip: int = 0, limit: int = 100) -> List[Room]:
    return db.exec(select(Room).offset(skip).limit(limit)).all()

def get_room(db: Session, room_id: int) -> Optional[Room]:
    return db.get(Room, room_id)

def create_room(db: Session, obj_in: RoomCreate) -> Room:
    db_obj = Room(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_room(db: Session, db_obj: Room, obj_in: RoomUpdate) -> Room:
    obj_data = obj_in.dict(exclude_unset=True)
    for field, value in obj_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_room(db: Session, room_id: int) -> None:
    db_obj = db.get(Room, room_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
