from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.room_utility import RoomUtility, RoomUtilityCreate, RoomUtilityUpdate
from app.crud.crud_room_utility import (
    get_room_utilities,
    get_room_utility,
    create_room_utility,
    update_room_utility,
    delete_room_utility,
)
from app.db.session import get_db

router = APIRouter()

@router.get("/room_utility/", response_model=List[RoomUtility])
def read_room_utilities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_room_utilities(db, skip=skip, limit=limit)

@router.get("/room_utility/{room_utility_id}", response_model=RoomUtility)
def read_room_utility(room_utility_id: int, db: Session = Depends(get_db)):
    db_obj = get_room_utility(db, room_utility_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="RoomUtility not found")
    return db_obj

@router.post("/room_utility/", response_model=RoomUtility)
def create_room_utility_view(obj_in: RoomUtilityCreate, db: Session = Depends(get_db)):
    return create_room_utility(db, obj_in)

@router.put("/room_utility/{room_utility_id}", response_model=RoomUtility)
def update_room_utility_view(room_utility_id: int, obj_in: RoomUtilityUpdate, db: Session = Depends(get_db)):
    db_obj = get_room_utility(db, room_utility_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="RoomUtility not found")
    return update_room_utility(db, db_obj, obj_in)

@router.delete("/room_utility/{room_utility_id}")
def delete_room_utility_view(room_utility_id: int, db: Session = Depends(get_db)):
    delete_room_utility(db, room_utility_id)
    return {"ok": True}
