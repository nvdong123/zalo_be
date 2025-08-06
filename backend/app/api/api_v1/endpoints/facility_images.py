from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_admin_user, verify_tenant_permission
from app.crud.crud_facility_images import facility_image
from app.schemas.facility_images import FacilityImageCreate, FacilityImageRead, FacilityImageUpdate
from app.models.models import TblAdminUsers

router = APIRouter()

@router.get("/facility-images", response_model=List[FacilityImageRead])
def read_facility_images(
    facility_id: int,
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get all images for a facility"""
    verify_tenant_permission(current_user, tenant_id)
    return facility_image.get_by_facility(db=db, facility_id=facility_id, tenant_id=tenant_id)

@router.post("/facility-images", response_model=FacilityImageRead)
def create_facility_image(
    *,
    obj_in: FacilityImageCreate,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Create new facility image"""
    verify_tenant_permission(current_user, obj_in.tenant_id)
    obj_in.created_by = current_user.username
    return facility_image.create(db=db, obj_in=obj_in, tenant_id=obj_in.tenant_id)

@router.get("/facility-images/{item_id}", response_model=FacilityImageRead)
def read_facility_image(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get facility image by ID"""
    verify_tenant_permission(current_user, tenant_id)
    facility_image_obj = facility_image.get(db=db, id=item_id, tenant_id=tenant_id)
    if not facility_image_obj:
        raise HTTPException(status_code=404, detail="Facility image not found")
    return facility_image_obj

@router.put("/facility-images/{item_id}", response_model=FacilityImageRead)
def update_facility_image(
    *,
    item_id: int,
    tenant_id: int,
    obj_in: FacilityImageUpdate,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Update facility image"""
    verify_tenant_permission(current_user, tenant_id)
    facility_image_obj = facility_image.get(db=db, id=item_id, tenant_id=tenant_id)
    if not facility_image_obj:
        raise HTTPException(status_code=404, detail="Facility image not found")
    
    obj_in.updated_by = current_user.username
    return facility_image.update(db=db, db_obj=facility_image_obj, obj_in=obj_in)

@router.delete("/facility-images/{item_id}")
def delete_facility_image(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Delete facility image"""
    verify_tenant_permission(current_user, tenant_id)
    facility_image_obj = facility_image.get(db=db, id=item_id, tenant_id=tenant_id)
    if not facility_image_obj:
        raise HTTPException(status_code=404, detail="Facility image not found")
    
    facility_image.remove(db=db, id=item_id, tenant_id=tenant_id, deleted_by=current_user.username)
    return {"message": "Facility image deleted successfully"}

@router.get("/facility-images/{facility_id}/primary", response_model=FacilityImageRead)
def get_primary_facility_image(
    *,
    facility_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get primary image for a facility"""
    verify_tenant_permission(current_user, tenant_id)
    primary_image = facility_image.get_primary_image(db=db, facility_id=facility_id, tenant_id=tenant_id)
    if not primary_image:
        raise HTTPException(status_code=404, detail="Primary facility image not found")
    return primary_image

@router.post("/facility-images/{image_id}/set-primary")
def set_primary_facility_image(
    *,
    image_id: int,
    facility_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Set an image as primary for a facility"""
    verify_tenant_permission(current_user, tenant_id)
    success = facility_image.set_primary_image(
        db=db, 
        facility_id=facility_id, 
        image_id=image_id, 
        tenant_id=tenant_id,
        current_user=current_user.username
    )
    if not success:
        raise HTTPException(status_code=400, detail="Failed to set primary image")
    return {"message": "Primary image set successfully"}
