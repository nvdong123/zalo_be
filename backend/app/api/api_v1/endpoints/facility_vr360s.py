from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_admin_user, verify_tenant_permission
from app.crud.crud_facility_vr360s import facility_vr360
from app.schemas.facility_vr360s import FacilityVr360Create, FacilityVr360Read, FacilityVr360Update
from app.models.models import TblAdminUsers

router = APIRouter()

@router.get("/facility-vr360s", response_model=List[FacilityVr360Read])
def read_facility_vr360s(
    facility_id: int,
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get all VR360s for a facility"""
    verify_tenant_permission(current_user, tenant_id)
    return facility_vr360.get_by_facility(db=db, facility_id=facility_id, tenant_id=tenant_id)

@router.post("/facility-vr360s", response_model=FacilityVr360Read)
def create_facility_vr360(
    *,
    obj_in: FacilityVr360Create,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Create new facility VR360"""
    verify_tenant_permission(current_user, obj_in.tenant_id)
    obj_in.created_by = current_user.username
    return facility_vr360.create(db=db, obj_in=obj_in, tenant_id=obj_in.tenant_id)

@router.get("/facility-vr360s/{item_id}", response_model=FacilityVr360Read)
def read_facility_vr360(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get facility VR360 by ID"""
    verify_tenant_permission(current_user, tenant_id)
    facility_vr360_obj = facility_vr360.get(db=db, id=item_id, tenant_id=tenant_id)
    if not facility_vr360_obj:
        raise HTTPException(status_code=404, detail="Facility VR360 not found")
    return facility_vr360_obj

@router.put("/facility-vr360s/{item_id}", response_model=FacilityVr360Read)
def update_facility_vr360(
    *,
    item_id: int,
    tenant_id: int,
    obj_in: FacilityVr360Update,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Update facility VR360"""
    verify_tenant_permission(current_user, tenant_id)
    facility_vr360_obj = facility_vr360.get(db=db, id=item_id, tenant_id=tenant_id)
    if not facility_vr360_obj:
        raise HTTPException(status_code=404, detail="Facility VR360 not found")
    
    obj_in.updated_by = current_user.username
    return facility_vr360.update(db=db, db_obj=facility_vr360_obj, obj_in=obj_in)

@router.delete("/facility-vr360s/{item_id}")
def delete_facility_vr360(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Delete facility VR360"""
    verify_tenant_permission(current_user, tenant_id)
    facility_vr360_obj = facility_vr360.get(db=db, id=item_id, tenant_id=tenant_id)
    if not facility_vr360_obj:
        raise HTTPException(status_code=404, detail="Facility VR360 not found")
    
    facility_vr360.remove(db=db, id=item_id, tenant_id=tenant_id, deleted_by=current_user.username)
    return {"message": "Facility VR360 deleted successfully"}

@router.post("/facility-vr360s/reorder")
def reorder_facility_vr360s(
    *,
    facility_id: int,
    tenant_id: int,
    vr360_orders: List[dict],
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Reorder VR360s for a facility"""
    verify_tenant_permission(current_user, tenant_id)
    success = facility_vr360.reorder_vr360s(
        db=db, 
        facility_id=facility_id, 
        vr360_orders=vr360_orders, 
        tenant_id=tenant_id,
        current_user=current_user.username
    )
    if not success:
        raise HTTPException(status_code=400, detail="Failed to reorder VR360s")
    return {"message": "VR360s reordered successfully"}
