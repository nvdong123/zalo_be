from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.models.models import TblVouchers
from app.schemas.vouchers import VoucherCreate, VoucherUpdate


class CRUDVoucher(CRUDBase[TblVouchers, VoucherCreate, VoucherUpdate]):
    def get_by_code(
        self, 
        db: Session, 
        *, 
        voucher_code: str,
        tenant_id: int
    ) -> Optional[TblVouchers]:
        """Get voucher by code"""
        return db.query(TblVouchers).filter(
            and_(
                TblVouchers.voucher_code == voucher_code,
                TblVouchers.tenant_id == tenant_id,
                TblVouchers.deleted == 0
            )
        ).first()

    def get_active_vouchers(
        self,
        db: Session,
        *,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblVouchers]:
        """Get active vouchers for a tenant"""
        return db.query(TblVouchers).filter(
            and_(
                TblVouchers.tenant_id == tenant_id,
                TblVouchers.is_active == True,
                TblVouchers.deleted == 0
            )
        ).offset(skip).limit(limit).all()

    def get_by_type(
        self,
        db: Session,
        *,
        voucher_type: str,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblVouchers]:
        """Get vouchers by type"""
        return db.query(TblVouchers).filter(
            and_(
                TblVouchers.voucher_type == voucher_type,
                TblVouchers.tenant_id == tenant_id,
                TblVouchers.deleted == 0
            )
        ).offset(skip).limit(limit).all()


voucher = CRUDVoucher(TblVouchers)
