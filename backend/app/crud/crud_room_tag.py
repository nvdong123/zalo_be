from sqlalchemy.orm import Session
from app.models.room_tag import RoomTag
from app.schemas.room_tag import RoomTagCreate, RoomTagUpdate
from typing import List, Optional

def get_room_tag(db: Session, id: int) -> Optional[RoomTag]:
    return db.query(RoomTag).filter(RoomTag.id == id).first()

def get_room_tags(db: Session, skip: int = 0, limit: int = 100) -> List[RoomTag]:
    return db.query(RoomTag).offset(skip).limit(limit).all()

def create_room_tag(db: Session, obj_in: RoomTagCreate) -> RoomTag:
    db_obj = RoomTag(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_room_tag(db: Session, db_obj: RoomTag, obj_in: RoomTagUpdate) -> RoomTag:
    update_data = obj_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_room_tag(db: Session, id: int) -> Optional[RoomTag]:
    obj = db.query(RoomTag).filter(RoomTag.id == id).first()
    if obj:
        db.delete(obj)
        db.commit()
    return obj
