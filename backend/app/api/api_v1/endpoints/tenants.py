from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.crud.crud_tenants import tenant
from app.schemas.tenants import TenantCreate, TenantRead, TenantUpdate

router = APIRouter()

@router.get("/tenants", response_model=List[TenantRead])
def read_tenants(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all tenants"""
    return tenant.get_multi(db=db, skip=skip, limit=limit)

@router.post("/tenants", response_model=TenantRead)
def create_tenant(
    *,
    obj_in: TenantCreate,
    db: Session = Depends(get_db)
):
    """Create new tenant"""
    # Check if domain already exists
    existing_tenant = tenant.get_by_domain(db=db, domain=obj_in.domain)
    if existing_tenant:
        raise HTTPException(status_code=400, detail="Domain already exists")
    
    return tenant.create(db=db, obj_in=obj_in)

@router.get("/tenants/{item_id}", response_model=TenantRead)
def read_tenant(
    *,
    item_id: int,
    db: Session = Depends(get_db)
):
    """Get tenant by ID"""
    obj = tenant.get(db=db, id=item_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return obj

@router.get("/tenants/domain/{domain}", response_model=TenantRead)
def read_tenant_by_domain(
    *,
    domain: str,
    db: Session = Depends(get_db)
):
    """Get tenant by domain"""
    obj = tenant.get_by_domain(db=db, domain=domain)
    if not obj:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return obj

@router.put("/tenants/{item_id}", response_model=TenantRead)
def update_tenant(
    *,
    item_id: int,
    obj_in: TenantUpdate,
    db: Session = Depends(get_db)
):
    """Update tenant"""
    obj = tenant.get(db=db, id=item_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/tenants/{item_id}")
def delete_tenant(
    *,
    item_id: int,
    deleted_by: str = None,
    db: Session = Depends(get_db)
):
    """Delete tenant"""
    obj = tenant.remove(db=db, id=item_id, deleted_by=deleted_by)
    if not obj:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"message": "Tenant deleted successfully"}
