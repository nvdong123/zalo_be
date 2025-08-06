from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_admin_user, verify_tenant_permission
from app.crud.crud_room_vr360s import room_vr360
from app.schemas.room_vr360s import RoomVr360Create, RoomVr360Read, RoomVr360Update
from app.models.models import TblAdminUsers

router = APIRouter()

@router.get("/room-vr360s", response_model=List[RoomVr360Read])
def read_room_vr360s(
    room_id: int,
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get all VR360s for a room"""
    verify_tenant_permission(current_user, tenant_id)
    return room_vr360.get_by_room(db=db, room_id=room_id, tenant_id=tenant_id)

@router.post("/room-vr360s", response_model=RoomVr360Read)
def create_room_vr360(
    *,
    obj_in: RoomVr360Create,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Create new room VR360"""
    verify_tenant_permission(current_user, obj_in.tenant_id)
    obj_in.created_by = current_user.username
    return room_vr360.create(db=db, obj_in=obj_in, tenant_id=obj_in.tenant_id)

@router.get("/room-vr360s/{item_id}", response_model=RoomVr360Read)
def read_room_vr360(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get room VR360 by ID"""
    verify_tenant_permission(current_user, tenant_id)
    room_vr360_obj = room_vr360.get(db=db, id=item_id, tenant_id=tenant_id)
    if not room_vr360_obj:
        raise HTTPException(status_code=404, detail="Room VR360 not found")
    return room_vr360_obj

@router.put("/room-vr360s/{item_id}", response_model=RoomVr360Read)
def update_room_vr360(
    *,
    item_id: int,
    tenant_id: int,
    obj_in: RoomVr360Update,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Update room VR360"""
    verify_tenant_permission(current_user, tenant_id)
    room_vr360_obj = room_vr360.get(db=db, id=item_id, tenant_id=tenant_id)
    if not room_vr360_obj:
        raise HTTPException(status_code=404, detail="Room VR360 not found")
    
    obj_in.updated_by = current_user.username
    return room_vr360.update(db=db, db_obj=room_vr360_obj, obj_in=obj_in)

@router.delete("/room-vr360s/{item_id}")
def delete_room_vr360(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Delete room VR360"""
    verify_tenant_permission(current_user, tenant_id)
    room_vr360_obj = room_vr360.get(db=db, id=item_id, tenant_id=tenant_id)
    if not room_vr360_obj:
        raise HTTPException(status_code=404, detail="Room VR360 not found")
    
    room_vr360.remove(db=db, id=item_id, tenant_id=tenant_id, deleted_by=current_user.username)
    return {"message": "Room VR360 deleted successfully"}

@router.post("/room-vr360s/reorder")
def reorder_room_vr360s(
    *,
    room_id: int,
    tenant_id: int,
    vr360_orders: List[dict],
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Reorder VR360s for a room"""
    verify_tenant_permission(current_user, tenant_id)
    success = room_vr360.reorder_vr360s(
        db=db, 
        room_id=room_id, 
        vr360_orders=vr360_orders, 
        tenant_id=tenant_id,
        current_user=current_user.username
    )
    if not success:
        raise HTTPException(status_code=400, detail="Failed to reorder VR360s")
    return {"message": "VR360s reordered successfully"}
