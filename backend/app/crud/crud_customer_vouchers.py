from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.models.models import TblCustomerVouchers
from app.schemas.customer_vouchers import CustomerVoucherCreate, CustomerVoucherUpdate


class CRUDCustomerVoucher(CRUDBase[TblCustomerVouchers, CustomerVoucherCreate, CustomerVoucherUpdate]):
    def get_by_customer(
        self, 
        db: Session, 
        *, 
        customer_id: int,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblCustomerVouchers]:
        """Get vouchers by customer"""
        return db.query(TblCustomerVouchers).filter(
            and_(
                TblCustomerVouchers.customer_id == customer_id,
                TblCustomerVouchers.tenant_id == tenant_id,
                TblCustomerVouchers.deleted == 0
            )
        ).offset(skip).limit(limit).all()

    def get_by_voucher(
        self,
        db: Session,
        *,
        voucher_id: int,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblCustomerVouchers]:
        """Get customer vouchers by voucher"""
        return db.query(TblCustomerVouchers).filter(
            and_(
                TblCustomerVouchers.voucher_id == voucher_id,
                TblCustomerVouchers.tenant_id == tenant_id,
                TblCustomerVouchers.deleted == 0
            )
        ).offset(skip).limit(limit).all()

    def get_used_vouchers(
        self,
        db: Session,
        *,
        customer_id: int,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblCustomerVouchers]:
        """Get used vouchers by customer"""
        return db.query(TblCustomerVouchers).filter(
            and_(
                TblCustomerVouchers.customer_id == customer_id,
                TblCustomerVouchers.tenant_id == tenant_id,
                TblCustomerVouchers.is_used == True,
                TblCustomerVouchers.deleted == 0
            )
        ).offset(skip).limit(limit).all()


customer_voucher = CRUDCustomerVoucher(TblCustomerVouchers)
