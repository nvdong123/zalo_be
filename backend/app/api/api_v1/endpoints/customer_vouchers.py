from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.crud.crud_customer_vouchers import customer_voucher
from app.schemas.customer_vouchers import CustomerVoucherCreate, CustomerVoucherRead, CustomerVoucherUpdate

router = APIRouter()

@router.get("/customer-vouchers", response_model=List[CustomerVoucherRead])
def read_customer_vouchers(
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all customer vouchers for a tenant"""
    return customer_voucher.get_multi(db=db, tenant_id=tenant_id, skip=skip, limit=limit)

@router.post("/customer-vouchers", response_model=CustomerVoucherRead)
def create_customer_voucher(
    *,
    tenant_id: int,
    obj_in: CustomerVoucherCreate,
    db: Session = Depends(get_db)
):
    """Create new customer voucher"""
    return customer_voucher.create(db=db, obj_in=obj_in, tenant_id=tenant_id)

@router.get("/customer-vouchers/{item_id}", response_model=CustomerVoucherRead)
def read_customer_voucher(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db)
):
    """Get customer voucher by ID"""
    obj = customer_voucher.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="customer_voucher not found")
    return obj

@router.put("/customer-vouchers/{item_id}", response_model=CustomerVoucherRead)
def update_customer_voucher(
    *,
    item_id: int,
    tenant_id: int,
    obj_in: CustomerVoucherUpdate,
    db: Session = Depends(get_db)
):
    """Update customer voucher"""
    obj = customer_voucher.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="customer_voucher not found")
    return customer_voucher.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/customer-vouchers/{item_id}")
def delete_customer_voucher(
    *,
    item_id: int,
    tenant_id: int,
    deleted_by: str = None,
    db: Session = Depends(get_db)
):
    """Delete customer voucher"""
    obj = customer_voucher.remove(db=db, id=item_id, tenant_id=tenant_id, deleted_by=deleted_by)
    if not obj:
        raise HTTPException(status_code=404, detail="customer_voucher not found")
    return {"message": "customer_voucher deleted successfully"}
