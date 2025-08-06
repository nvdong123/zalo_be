from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.crud.crud_room_stays import room_stay
from app.schemas.room_stays import RoomStayCreate, RoomStayRead, RoomStayUpdate

router = APIRouter()

@router.get("/room-stays", response_model=List[RoomStayRead])
def read_room_stays(
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all room stays for a tenant"""
    return room_stay.get_multi(db=db, tenant_id=tenant_id, skip=skip, limit=limit)

@router.post("/room-stays", response_model=RoomStayRead)
def create_room_stay(
    *,
    tenant_id: int,
    obj_in: RoomStayCreate,
    db: Session = Depends(get_db)
):
    """Create new room stays"""
    return room_stay.create(db=db, obj_in=obj_in, tenant_id=tenant_id)

@router.get("/room-stays/{item_id}", response_model=RoomStayRead)
def read_room_stay(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db)
):
    """Get room stays by ID"""
    obj = room_stay.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="room_stay not found")
    return obj

@router.put("/room-stays/{item_id}", response_model=RoomStayRead)
def update_room_stay(
    *,
    item_id: int,
    tenant_id: int,
    obj_in: RoomStayUpdate,
    db: Session = Depends(get_db)
):
    """Update room stays"""
    obj = room_stay.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="room_stay not found")
    return room_stay.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/room-stays/{item_id}")
def delete_room_stay(
    *,
    item_id: int,
    tenant_id: int,
    deleted_by: str = None,
    db: Session = Depends(get_db)
):
    """Delete room stays"""
    obj = room_stay.remove(db=db, id=item_id, tenant_id=tenant_id, deleted_by=deleted_by)
    if not obj:
        raise HTTPException(status_code=404, detail="room_stay not found")
    return {"message": "room_stay deleted successfully"}
