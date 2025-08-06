from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.crud.crud_customers import customer
from app.schemas.customers import CustomerCreate, CustomerRead, CustomerUpdate

router = APIRouter()

@router.get("/customers", response_model=List[CustomerRead])
def read_customers(
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all customers for a tenant"""
    return customer.get_multi(db=db, tenant_id=tenant_id, skip=skip, limit=limit)

@router.post("/customers", response_model=CustomerRead)
def create_customer(
    *,
    tenant_id: int,
    obj_in: CustomerCreate,
    db: Session = Depends(get_db)
):
    """Create new customer"""
    return customer.create(db=db, obj_in=obj_in, tenant_id=tenant_id)

@router.get("/customers/{item_id}", response_model=CustomerRead)
def read_customer(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db)
):
    """Get customer by ID"""
    obj = customer.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Customer not found")
    return obj

@router.put("/customers/{item_id}", response_model=CustomerRead)
def update_customer(
    *,
    item_id: int,
    tenant_id: int,
    obj_in: CustomerUpdate,
    db: Session = Depends(get_db)
):
    """Update customer"""
    obj = customer.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/customers/{item_id}")
def delete_customer(
    *,
    item_id: int,
    tenant_id: int,
    deleted_by: str = None,
    db: Session = Depends(get_db)
):
    """Delete customer"""
    obj = customer.remove(db=db, id=item_id, tenant_id=tenant_id, deleted_by=deleted_by)
    if not obj:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted successfully"}
