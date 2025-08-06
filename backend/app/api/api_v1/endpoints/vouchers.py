from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.crud.crud_vouchers import voucher
from app.schemas.vouchers import VoucherCreate, VoucherRead, VoucherUpdate

router = APIRouter()

@router.get("/vouchers", response_model=List[VoucherRead])
def read_vouchers(
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all vouchers for a tenant"""
    return voucher.get_multi(db=db, tenant_id=tenant_id, skip=skip, limit=limit)

@router.post("/vouchers", response_model=VoucherRead)
def create_voucher(
    *,
    tenant_id: int,
    obj_in: VoucherCreate,
    db: Session = Depends(get_db)
):
    """Create new voucher"""
    return voucher.create(db=db, obj_in=obj_in, tenant_id=tenant_id)

@router.get("/vouchers/{item_id}", response_model=VoucherRead)
def read_voucher(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db)
):
    """Get voucher by ID"""
    obj = voucher.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Voucher not found")
    return obj

@router.put("/vouchers/{item_id}", response_model=VoucherRead)
def update_voucher(
    *,
    item_id: int,
    tenant_id: int,
    obj_in: VoucherUpdate,
    db: Session = Depends(get_db)
):
    """Update voucher"""
    obj = voucher.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Voucher not found")
    return voucher.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/vouchers/{item_id}")
def delete_voucher(
    *,
    item_id: int,
    tenant_id: int,
    deleted_by: str = None,
    db: Session = Depends(get_db)
):
    """Delete voucher"""
    obj = voucher.remove(db=db, id=item_id, tenant_id=tenant_id, deleted_by=deleted_by)
    if not obj:
        raise HTTPException(status_code=404, detail="Voucher not found")
    return {"message": "Voucher deleted successfully"}
