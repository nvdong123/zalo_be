from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_admin_user, verify_tenant_permission
from app.crud.crud_vouchers import voucher
from app.schemas.vouchers import VoucherCreate, VoucherRead, VoucherUpdate, VoucherCreateRequest, VoucherUpdateRequest
from app.models.models import TblAdminUsers

router = APIRouter()

@router.get("/vouchers", response_model=List[VoucherRead])
def read_vouchers(
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get all vouchers for a tenant"""
    verify_tenant_permission(tenant_id, current_user)
    return voucher.get_multi(db=db, tenant_id=tenant_id, skip=skip, limit=limit)

@router.post("/vouchers", response_model=VoucherRead)
def create_voucher(
    *,
    tenant_id: int,
    obj_in: VoucherCreateRequest,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Create new voucher"""
    verify_tenant_permission(tenant_id, current_user)
    
    # Convert VoucherCreateRequest to VoucherCreate with tenant_id
    voucher_data = obj_in.dict()
    voucher_data['tenant_id'] = tenant_id
    voucher_data['created_by'] = current_user.username
    voucher_create = VoucherCreate(**voucher_data)
    
    return voucher.create(db=db, obj_in=voucher_create, tenant_id=tenant_id)

@router.get("/vouchers/{item_id}", response_model=VoucherRead)
def read_voucher(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get voucher by ID"""
    verify_tenant_permission(tenant_id, current_user)
    obj = voucher.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Voucher not found")
    return obj
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
