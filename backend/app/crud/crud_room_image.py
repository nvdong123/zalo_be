from sqlmodel import Session, select
from app.models.room_image import RoomImage
from app.schemas.room_image import RoomImageCreate, RoomImageUpdate
from typing import List, Optional

def get_room_images(db: Session, skip: int = 0, limit: int = 100) -> List[RoomImage]:
    return db.exec(select(RoomImage).offset(skip).limit(limit)).all()

def get_room_image(db: Session, room_image_id: int) -> Optional[RoomImage]:
    return db.get(RoomImage, room_image_id)

def create_room_image(db: Session, obj_in: RoomImageCreate) -> RoomImage:
    db_obj = RoomImage(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_room_image(db: Session, db_obj: RoomImage, obj_in: RoomImageUpdate) -> RoomImage:
    obj_data = obj_in.dict(exclude_unset=True)
    for field, value in obj_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_room_image(db: Session, room_image_id: int) -> None:
    db_obj = db.get(RoomImage, room_image_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
