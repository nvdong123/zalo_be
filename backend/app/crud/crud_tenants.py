from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime

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

    def create(self, db: Session, *, obj_in: TenantCreate) -> TblTenants:
        """Create new tenant - override to not require tenant_id"""
        if isinstance(obj_in, dict):
            create_data = obj_in
        else:
            create_data = obj_in.dict(exclude_unset=True)
            
        db_obj = TblTenants(**create_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: TblTenants, obj_in: TenantUpdate) -> TblTenants:
        """Update tenant - override to not require tenant_id"""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
            
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int, deleted_by: str = None) -> TblTenants:
        """Soft delete tenant - override to not require tenant_id"""
        obj = db.query(TblTenants).filter(
            and_(TblTenants.id == id, TblTenants.deleted == 0)
        ).first()
        if obj:
            obj.deleted = 1
            obj.deleted_at = datetime.now()
            if deleted_by:
                obj.deleted_by = deleted_by
            db.add(obj)
            db.commit()
            return obj
        return None


tenant = CRUDTenant(TblTenants)
