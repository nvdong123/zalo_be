from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.models.models import TblServices
from app.schemas.services import ServiceCreate, ServiceUpdate


class CRUDService(CRUDBase[TblServices, ServiceCreate, ServiceUpdate]):
    def get_by_category(
        self, 
        db: Session, 
        *, 
        category: str, 
        tenant_id: int
    ) -> List[TblServices]:
        """Get services by category"""
        return db.query(TblServices).filter(
            and_(
                TblServices.category == category,
                TblServices.tenant_id == tenant_id,
                TblServices.deleted == 0
            )
        ).all()

    def get_active_services(
        self,
        db: Session,
        *,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblServices]:
        """Get active services"""
        return db.query(TblServices).filter(
            and_(
                TblServices.is_active == True,
                TblServices.tenant_id == tenant_id,
                TblServices.deleted == 0
            )
        ).offset(skip).limit(limit).all()

    def search_services(
        self,
        db: Session,
        *,
        tenant_id: int,
        search_term: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblServices]:
        """Search services by name or description"""
        return db.query(TblServices).filter(
            and_(
                TblServices.tenant_id == tenant_id,
                TblServices.deleted == 0,
                (TblServices.service_name.contains(search_term) | 
                 TblServices.description.contains(search_term))
            )
        ).offset(skip).limit(limit).all()


service = CRUDService(TblServices)
