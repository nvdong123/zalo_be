from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.models.models import TblTenants
from app.schemas.tenants import TenantCreate, TenantUpdate


class CRUDTenant(CRUDBase[TblTenants, TenantCreate, TenantUpdate]):
    def get_by_name(
        self, 
        db: Session, 
        *, 
        tenant_name: str
    ) -> Optional[TblTenants]:
        """Get tenant by name"""
        return db.query(TblTenants).filter(
            and_(
                TblTenants.tenant_name == tenant_name,
                TblTenants.deleted == 0
            )
        ).first()

    def get_active_tenants(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblTenants]:
        """Get active tenants"""
        return db.query(TblTenants).filter(
            and_(
                TblTenants.status == "active",
                TblTenants.deleted == 0
            )
        ).offset(skip).limit(limit).all()

    # Override get method since tenants don't filter by tenant_id
    def get(self, db: Session, id: int) -> Optional[TblTenants]:
        """Get single tenant by ID"""
        return db.query(TblTenants).filter(
            and_(
                TblTenants.id == id,
                TblTenants.deleted == 0
            )
        ).first()

    # Override get_multi since tenants don't filter by tenant_id
    def get_multi(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        include_deleted: bool = False
    ) -> List[TblTenants]:
        """Get multiple tenants"""
        query = db.query(TblTenants)
        
        if not include_deleted:
            query = query.filter(TblTenants.deleted == 0)
            
        return query.offset(skip).limit(limit).all()


    def get_by_domain(self, db: Session, domain: str) -> Optional[TblTenants]:
        """Get tenant by domain"""
        return db.query(TblTenants).filter(
            and_(
                TblTenants.domain == domain,
                TblTenants.deleted == 0
            )
        ).first()


tenant = CRUDTenant(TblTenants)
