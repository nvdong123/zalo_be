from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.crud.crud_services import service
from app.schemas.services import ServiceCreate, ServiceRead, ServiceUpdate

router = APIRouter()

@router.get("/services", response_model=List[ServiceRead])
def read_services(
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all services for a tenant"""
    return service.get_multi(db=db, tenant_id=tenant_id, skip=skip, limit=limit)

@router.post("/services", response_model=ServiceRead)
def create_service(
    *,
    tenant_id: int,
    obj_in: ServiceCreate,
    db: Session = Depends(get_db)
):
    """Create new service"""
    return service.create(db=db, obj_in=obj_in, tenant_id=tenant_id)

@router.get("/services/{item_id}", response_model=ServiceRead)
def read_service(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db)
):
    """Get service by ID"""
    obj = service.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Service not found")
    return obj

@router.put("/services/{item_id}", response_model=ServiceRead)
def update_service(
    *,
    item_id: int,
    tenant_id: int,
    obj_in: ServiceUpdate,
    db: Session = Depends(get_db)
):
    """Update service"""
    obj = service.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Service not found")
    return service.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/services/{item_id}")
def delete_service(
    *,
    item_id: int,
    tenant_id: int,
    deleted_by: str = None,
    db: Session = Depends(get_db)
):
    """Delete service"""
    obj = service.remove(db=db, id=item_id, tenant_id=tenant_id, deleted_by=deleted_by)
    if not obj:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted successfully"}
