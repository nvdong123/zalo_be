from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_admin_user, verify_tenant_permission
from app.crud.crud_room_videos import room_video
from app.schemas.room_videos import RoomVideoCreate, RoomVideoRead, RoomVideoUpdate
from app.models.models import TblAdminUsers

router = APIRouter()

@router.get("/room-videos", response_model=List[RoomVideoRead])
def read_room_videos(
    room_id: int,
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get all videos for a room"""
    verify_tenant_permission(current_user, tenant_id)
    return room_video.get_by_room(db=db, room_id=room_id, tenant_id=tenant_id)

@router.post("/room-videos", response_model=RoomVideoRead)
def create_room_video(
    *,
    obj_in: RoomVideoCreate,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Create new room video"""
    verify_tenant_permission(current_user, obj_in.tenant_id)
    obj_in.created_by = current_user.username
    return room_video.create(db=db, obj_in=obj_in, tenant_id=obj_in.tenant_id)

@router.get("/room-videos/{item_id}", response_model=RoomVideoRead)
def read_room_video(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get room video by ID"""
    verify_tenant_permission(current_user, tenant_id)
    room_video_obj = room_video.get(db=db, id=item_id, tenant_id=tenant_id)
    if not room_video_obj:
        raise HTTPException(status_code=404, detail="Room video not found")
    return room_video_obj

@router.put("/room-videos/{item_id}", response_model=RoomVideoRead)
def update_room_video(
    *,
    item_id: int,
    tenant_id: int,
    obj_in: RoomVideoUpdate,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Update room video"""
    verify_tenant_permission(current_user, tenant_id)
    room_video_obj = room_video.get(db=db, id=item_id, tenant_id=tenant_id)
    if not room_video_obj:
        raise HTTPException(status_code=404, detail="Room video not found")
    
    obj_in.updated_by = current_user.username
    return room_video.update(db=db, db_obj=room_video_obj, obj_in=obj_in)

@router.delete("/room-videos/{item_id}")
def delete_room_video(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Delete room video"""
    verify_tenant_permission(current_user, tenant_id)
    room_video_obj = room_video.get(db=db, id=item_id, tenant_id=tenant_id)
    if not room_video_obj:
        raise HTTPException(status_code=404, detail="Room video not found")
    
    room_video.remove(db=db, id=item_id, tenant_id=tenant_id, deleted_by=current_user.username)
    return {"message": "Room video deleted successfully"}

@router.post("/room-videos/reorder")
def reorder_room_videos(
    *,
    room_id: int,
    tenant_id: int,
    video_orders: List[dict],
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Reorder videos for a room"""
    verify_tenant_permission(current_user, tenant_id)
    success = room_video.reorder_videos(
        db=db, 
        room_id=room_id, 
        video_orders=video_orders, 
        tenant_id=tenant_id,
        current_user=current_user.username
    )
    if not success:
        raise HTTPException(status_code=400, detail="Failed to reorder videos")
    return {"message": "Videos reordered successfully"}
