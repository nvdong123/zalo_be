from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_admin_user, verify_tenant_permission
from app.crud.crud_facilities import facility
from app.schemas.facilities import FacilityCreate, FacilityRead, FacilityUpdate, FacilityCreateRequest, FacilityUpdateRequest
from app.models.models import TblAdminUsers

router = APIRouter()

@router.get("/facilities", response_model=List[FacilityRead])
def read_facilities(
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get all facilities for a tenant"""
    verify_tenant_permission(tenant_id, current_user)
    return facility.get_multi(db=db, tenant_id=tenant_id, skip=skip, limit=limit)

@router.post("/facilities", response_model=FacilityRead)
def create_facilitie(
    *,
    tenant_id: int,
    obj_in: FacilityCreateRequest,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Create new facilitie"""
    verify_tenant_permission(tenant_id, current_user)
    
    # Convert FacilityCreateRequest to FacilityCreate with tenant_id
    facility_data = obj_in.dict()
    facility_data['tenant_id'] = tenant_id
    facility_data['created_by'] = current_user.username
    facility_create = FacilityCreate(**facility_data)
    
    return facility.create(db=db, obj_in=facility_create, tenant_id=tenant_id)

@router.get("/facilities/{item_id}", response_model=FacilityRead)
def read_facilitie(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get facilitie by ID"""
    verify_tenant_permission(tenant_id, current_user)
    obj = facility.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Facilitie not found")
    return obj

@router.put("/facilities/{item_id}", response_model=FacilityRead)
def update_facilitie(
    *,
    item_id: int,
    tenant_id: int,
    obj_in: FacilityUpdateRequest,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Update facilitie"""
    verify_tenant_permission(tenant_id, current_user)
    obj = facility.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Facilitie not found")
    
    return facility.update(db=db, db_obj=obj, obj_in=obj_in, updated_by=current_user.username)

@router.delete("/facilities/{item_id}")
def delete_facilitie(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Delete facilitie"""
    verify_tenant_permission(tenant_id, current_user)
    obj = facility.remove(db=db, id=item_id, tenant_id=tenant_id, deleted_by=current_user.username)
    if not obj:
        raise HTTPException(status_code=404, detail="Facilitie not found")
    return {"message": "Facilitie deleted successfully"}
