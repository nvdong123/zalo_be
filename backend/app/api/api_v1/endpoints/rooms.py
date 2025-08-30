from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_admin_user, get_tenant_admin, verify_tenant_permission
from app.crud.crud_rooms import room
from app.schemas.rooms import RoomCreate, RoomRead, RoomUpdate, RoomCreateRequest
from app.models.models import TblAdminUsers

router = APIRouter()

@router.get("/rooms", response_model=List[RoomRead])
def read_rooms(
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_tenant_admin)
):
    """Get all rooms for a tenant"""
    verify_tenant_permission(tenant_id, current_user)
    return room.get_multi(db=db, tenant_id=tenant_id, skip=skip, limit=limit)

@router.post("/rooms", response_model=RoomRead)
def create_room(
    *,
    tenant_id: int,
    obj_in: RoomCreateRequest,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_tenant_admin)
):
    """Create new room"""
    verify_tenant_permission(tenant_id, current_user)
    
    # Convert RoomCreateRequest to RoomCreate with tenant_id
    room_data = obj_in.dict()
    room_data['tenant_id'] = tenant_id
    room_create = RoomCreate(**room_data)
    
    return room.create(db=db, obj_in=room_create, tenant_id=tenant_id)

@router.get("/rooms/{item_id}", response_model=RoomRead)
def read_room(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db)
):
    """Get room by ID"""
    obj = room.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Room not found")
    return obj

@router.put("/rooms/{item_id}", response_model=RoomRead)
def update_room(
    *,
    item_id: int,
    tenant_id: int,
    obj_in: RoomUpdate,
    db: Session = Depends(get_db)
):
    """Update room"""
    obj = room.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Room not found")
    return room.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/rooms/{item_id}")
def delete_room(
    *,
    item_id: int,
    tenant_id: int,
    deleted_by: str = None,
    db: Session = Depends(get_db)
):
    """Delete room"""
    obj = room.remove(db=db, id=item_id, tenant_id=tenant_id, deleted_by=deleted_by)
    if not obj:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"message": "Room deleted successfully"}
