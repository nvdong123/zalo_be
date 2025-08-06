from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.rooms import RoomRead as Room, RoomCreate, RoomUpdate
from app.crud.crud_rooms import (
    get_rooms,
    get_room,
    create_room,
    update_room,
    delete_room,
)
from app.db.session_mysql import get_db

router = APIRouter()

@router.get("/room/", response_model=List[Room])
def read_rooms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_rooms(db, skip=skip, limit=limit)

@router.get("/room/{room_id}", response_model=Room)
def read_room(room_id: int, db: Session = Depends(get_db)):
    db_obj = get_room(db, room_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="Room not found")
    return db_obj

@router.post("/room/", response_model=Room)
def create_room_view(obj_in: RoomCreate, db: Session = Depends(get_db)):
    return create_room(db, obj_in)

@router.put("/room/{room_id}", response_model=Room)
def update_room_view(room_id: int, obj_in: RoomUpdate, db: Session = Depends(get_db)):
    db_obj = get_room(db, room_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="Room not found")
    return update_room(db, db_obj, obj_in)

@router.delete("/room/{room_id}")
def delete_room_view(room_id: int, db: Session = Depends(get_db)):
    delete_room(db, room_id)
    return {"ok": True}
