from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.room_character import RoomCharacter, RoomCharacterCreate, RoomCharacterUpdate
from app.crud.crud_room_character import (
    get_room_characters,
    get_room_character,
    create_room_character,
    update_room_character,
    delete_room_character,
)
from app.db.session import get_db

router = APIRouter()

@router.get("/room_character/", response_model=List[RoomCharacter])
def read_room_characters(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_room_characters(db, skip=skip, limit=limit)

@router.get("/room_character/{room_character_id}", response_model=RoomCharacter)
def read_room_character(room_character_id: int, db: Session = Depends(get_db)):
    db_obj = get_room_character(db, room_character_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="RoomCharacter not found")
    return db_obj

@router.post("/room_character/", response_model=RoomCharacter)
def create_room_character_view(obj_in: RoomCharacterCreate, db: Session = Depends(get_db)):
    return create_room_character(db, obj_in)

@router.put("/room_character/{room_character_id}", response_model=RoomCharacter)
def update_room_character_view(room_character_id: int, obj_in: RoomCharacterUpdate, db: Session = Depends(get_db)):
    db_obj = get_room_character(db, room_character_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="RoomCharacter not found")
    return update_room_character(db, db_obj, obj_in)

@router.delete("/room_character/{room_character_id}")
def delete_room_character_view(room_character_id: int, db: Session = Depends(get_db)):
    delete_room_character(db, room_character_id)
    return {"ok": True}
