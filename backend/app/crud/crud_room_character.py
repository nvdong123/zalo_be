from sqlmodel import Session, select
from app.models.room_character import RoomCharacter
from app.schemas.room_character import RoomCharacterCreate, RoomCharacterUpdate
from typing import List, Optional

def get_room_characters(db: Session, skip: int = 0, limit: int = 100) -> List[RoomCharacter]:
    return db.exec(select(RoomCharacter).offset(skip).limit(limit)).all()

def get_room_character(db: Session, room_character_id: int) -> Optional[RoomCharacter]:
    return db.get(RoomCharacter, room_character_id)

def create_room_character(db: Session, obj_in: RoomCharacterCreate) -> RoomCharacter:
    db_obj = RoomCharacter(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_room_character(db: Session, db_obj: RoomCharacter, obj_in: RoomCharacterUpdate) -> RoomCharacter:
    obj_data = obj_in.dict(exclude_unset=True)
    for field, value in obj_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_room_character(db: Session, room_character_id: int) -> None:
    db_obj = db.get(RoomCharacter, room_character_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
