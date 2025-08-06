from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_admin_user, verify_tenant_permission
from app.crud.crud_room_images import room_image
from app.schemas.room_images import RoomImageCreate, RoomImageRead, RoomImageUpdate
from app.models.models import TblAdminUsers

router = APIRouter()

@router.get("/room-images", response_model=List[RoomImageRead])
def read_room_images(
    room_id: int,
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get all images for a room"""
    verify_tenant_permission(current_user, tenant_id)
    return room_image.get_by_room(db=db, room_id=room_id, tenant_id=tenant_id)

@router.post("/room-images", response_model=RoomImageRead)
def create_room_image(
    *,
    obj_in: RoomImageCreate,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Create new room image"""
    verify_tenant_permission(current_user, obj_in.tenant_id)
    obj_in.created_by = current_user.username
    return room_image.create(db=db, obj_in=obj_in, tenant_id=obj_in.tenant_id)

@router.get("/room-images/{item_id}", response_model=RoomImageRead)
def read_room_image(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get room image by ID"""
    verify_tenant_permission(current_user, tenant_id)
    room_image_obj = room_image.get(db=db, id=item_id, tenant_id=tenant_id)
    if not room_image_obj:
        raise HTTPException(status_code=404, detail="Room image not found")
    return room_image_obj

@router.put("/room-images/{item_id}", response_model=RoomImageRead)
def update_room_image(
    *,
    item_id: int,
    tenant_id: int,
    obj_in: RoomImageUpdate,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Update room image"""
    verify_tenant_permission(current_user, tenant_id)
    room_image_obj = room_image.get(db=db, id=item_id, tenant_id=tenant_id)
    if not room_image_obj:
        raise HTTPException(status_code=404, detail="Room image not found")
    
    obj_in.updated_by = current_user.username
    return room_image.update(db=db, db_obj=room_image_obj, obj_in=obj_in)

@router.delete("/room-images/{item_id}")
def delete_room_image(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Delete room image"""
    verify_tenant_permission(current_user, tenant_id)
    room_image_obj = room_image.get(db=db, id=item_id, tenant_id=tenant_id)
    if not room_image_obj:
        raise HTTPException(status_code=404, detail="Room image not found")
    
    room_image.remove(db=db, id=item_id, tenant_id=tenant_id, deleted_by=current_user.username)
    return {"message": "Room image deleted successfully"}

@router.get("/room-images/{room_id}/primary", response_model=RoomImageRead)
def get_primary_room_image(
    *,
    room_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get primary image for a room"""
    verify_tenant_permission(current_user, tenant_id)
    primary_image = room_image.get_primary_image(db=db, room_id=room_id, tenant_id=tenant_id)
    if not primary_image:
        raise HTTPException(status_code=404, detail="Primary room image not found")
    return primary_image

@router.post("/room-images/{image_id}/set-primary")
def set_primary_room_image(
    *,
    image_id: int,
    room_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Set an image as primary for a room"""
    verify_tenant_permission(current_user, tenant_id)
    success = room_image.set_primary_image(
        db=db, 
        room_id=room_id, 
        image_id=image_id, 
        tenant_id=tenant_id,
        current_user=current_user.username
    )
    if not success:
        raise HTTPException(status_code=400, detail="Failed to set primary image")
    return {"message": "Primary image set successfully"}
