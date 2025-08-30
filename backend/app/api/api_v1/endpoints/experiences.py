from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_admin_user, verify_tenant_permission
from app.crud.crud_experiences import experience
from app.schemas.experiences import ExperienceCreate, ExperienceRead, ExperienceUpdate
from app.models.models import TblAdminUsers

router = APIRouter()

@router.get("/experiences", response_model=List[ExperienceRead])
def read_experiences(
    tenant_id: int,
    type: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get all experiences for a tenant, optionally filtered by type"""
    verify_tenant_permission(tenant_id, current_user)
    if type:
        return experience.get_by_type(db=db, type=type, tenant_id=tenant_id)
    return experience.get_multi(db=db, tenant_id=tenant_id, skip=skip, limit=limit)

@router.post("/experiences", response_model=ExperienceRead)
def create_experience(
    *,
    obj_in: ExperienceCreate,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Create new experience"""
    verify_tenant_permission(current_user, obj_in.tenant_id)
    obj_in.created_by = current_user.username
    return experience.create(db=db, obj_in=obj_in, tenant_id=obj_in.tenant_id)

@router.get("/experiences/{item_id}", response_model=ExperienceRead)
def read_experience(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get experience by ID"""
    verify_tenant_permission(current_user, tenant_id)
    obj = experience.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Experience not found")
    return obj

@router.put("/experiences/{item_id}", response_model=ExperienceRead)
def update_experience(
    *,
    item_id: int,
    obj_in: ExperienceUpdate,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Update experience"""
    verify_tenant_permission(current_user, obj_in.tenant_id)
    obj = experience.get(db=db, id=item_id, tenant_id=obj_in.tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Experience not found")
    obj_in.updated_by = current_user.username
    return experience.update(db=db, db_obj=obj, obj_in=obj_in, tenant_id=obj_in.tenant_id)

@router.delete("/experiences/{item_id}")
def delete_experience(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Delete experience"""
    verify_tenant_permission(current_user, tenant_id)
    obj = experience.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Experience not found")
    experience.remove(db=db, id=item_id, tenant_id=tenant_id)
    return {"message": "Experience deleted successfully"}
