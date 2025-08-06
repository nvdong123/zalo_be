from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.room_image import RoomImage, RoomImageCreate, RoomImageUpdate
from app.crud.crud_room_image import (
    get_room_images,
    get_room_image,
    create_room_image,
    update_room_image,
    delete_room_image,
)
from app.db.session_mysql import get_db

router = APIRouter()

@router.get("/room_image/", response_model=List[RoomImage])
def read_room_images(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_room_images(db, skip=skip, limit=limit)

@router.get("/room_image/{room_image_id}", response_model=RoomImage)
def read_room_image(room_image_id: int, db: Session = Depends(get_db)):
    db_obj = get_room_image(db, room_image_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="RoomImage not found")
    return db_obj

@router.post("/room_image/", response_model=RoomImage)
def create_room_image_view(obj_in: RoomImageCreate, db: Session = Depends(get_db)):
    return create_room_image(db, obj_in)

@router.put("/room_image/{room_image_id}", response_model=RoomImage)
def update_room_image_view(room_image_id: int, obj_in: RoomImageUpdate, db: Session = Depends(get_db)):
    db_obj = get_room_image(db, room_image_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="RoomImage not found")
    return update_room_image(db, db_obj, obj_in)

@router.delete("/room_image/{room_image_id}")
def delete_room_image_view(room_image_id: int, db: Session = Depends(get_db)):
    delete_room_image(db, room_image_id)
    return {"ok": True}
