from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.models.models import TblCustomers
from app.schemas.customers import CustomerCreate, CustomerUpdate


class CRUDCustomer(CRUDBase[TblCustomers, CustomerCreate, CustomerUpdate]):
    def get_by_email(
        self, 
        db: Session, 
        *, 
        email: str, 
        tenant_id: int
    ) -> Optional[TblCustomers]:
        """Get customer by email"""
        return db.query(TblCustomers).filter(
            and_(
                TblCustomers.email == email,
                TblCustomers.tenant_id == tenant_id,
                TblCustomers.deleted == 0
            )
        ).first()

    def get_by_phone(
        self, 
        db: Session, 
        *, 
        phone: str, 
        tenant_id: int
    ) -> Optional[TblCustomers]:
        """Get customer by phone"""
        return db.query(TblCustomers).filter(
            and_(
                TblCustomers.phone == phone,
                TblCustomers.tenant_id == tenant_id,
                TblCustomers.deleted == 0
            )
        ).first()

    def search_customers(
        self,
        db: Session,
        *,
        tenant_id: int,
        search_term: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblCustomers]:
        """Search customers by name, email or phone"""
        return db.query(TblCustomers).filter(
            and_(
                TblCustomers.tenant_id == tenant_id,
                TblCustomers.deleted == 0,
                (TblCustomers.full_name.contains(search_term) | 
                 TblCustomers.email.contains(search_term) |
                 TblCustomers.phone.contains(search_term))
            )
        ).offset(skip).limit(limit).all()


customer = CRUDCustomer(TblCustomers)
