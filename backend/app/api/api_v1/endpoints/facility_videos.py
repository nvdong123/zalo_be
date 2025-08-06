from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_admin_user, verify_tenant_permission
from app.crud.crud_facility_videos import facility_video
from app.schemas.facility_videos import FacilityVideoCreate, FacilityVideoRead, FacilityVideoUpdate
from app.models.models import TblAdminUsers

router = APIRouter()

@router.get("/facility-videos", response_model=List[FacilityVideoRead])
def read_facility_videos(
    facility_id: int,
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get all videos for a facility"""
    verify_tenant_permission(current_user, tenant_id)
    return facility_video.get_by_facility(db=db, facility_id=facility_id, tenant_id=tenant_id)

@router.post("/facility-videos", response_model=FacilityVideoRead)
def create_facility_video(
    *,
    obj_in: FacilityVideoCreate,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Create new facility video"""
    verify_tenant_permission(current_user, obj_in.tenant_id)
    obj_in.created_by = current_user.username
    return facility_video.create(db=db, obj_in=obj_in, tenant_id=obj_in.tenant_id)

@router.get("/facility-videos/{item_id}", response_model=FacilityVideoRead)
def read_facility_video(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get facility video by ID"""
    verify_tenant_permission(current_user, tenant_id)
    facility_video_obj = facility_video.get(db=db, id=item_id, tenant_id=tenant_id)
    if not facility_video_obj:
        raise HTTPException(status_code=404, detail="Facility video not found")
    return facility_video_obj

@router.put("/facility-videos/{item_id}", response_model=FacilityVideoRead)
def update_facility_video(
    *,
    item_id: int,
    tenant_id: int,
    obj_in: FacilityVideoUpdate,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Update facility video"""
    verify_tenant_permission(current_user, tenant_id)
    facility_video_obj = facility_video.get(db=db, id=item_id, tenant_id=tenant_id)
    if not facility_video_obj:
        raise HTTPException(status_code=404, detail="Facility video not found")
    
    obj_in.updated_by = current_user.username
    return facility_video.update(db=db, db_obj=facility_video_obj, obj_in=obj_in)

@router.delete("/facility-videos/{item_id}")
def delete_facility_video(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Delete facility video"""
    verify_tenant_permission(current_user, tenant_id)
    facility_video_obj = facility_video.get(db=db, id=item_id, tenant_id=tenant_id)
    if not facility_video_obj:
        raise HTTPException(status_code=404, detail="Facility video not found")
    
    facility_video.remove(db=db, id=item_id, tenant_id=tenant_id, deleted_by=current_user.username)
    return {"message": "Facility video deleted successfully"}

@router.post("/facility-videos/reorder")
def reorder_facility_videos(
    *,
    facility_id: int,
    tenant_id: int,
    video_orders: List[dict],
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Reorder videos for a facility"""
    verify_tenant_permission(current_user, tenant_id)
    success = facility_video.reorder_videos(
        db=db, 
        facility_id=facility_id, 
        video_orders=video_orders, 
        tenant_id=tenant_id,
        current_user=current_user.username
    )
    if not success:
        raise HTTPException(status_code=400, detail="Failed to reorder videos")
    return {"message": "Videos reordered successfully"}
