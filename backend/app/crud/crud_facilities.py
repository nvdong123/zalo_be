from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.models.models import TblFacilities
from app.schemas.facilities import FacilityCreate, FacilityUpdate


class CRUDFacility(CRUDBase[TblFacilities, FacilityCreate, FacilityUpdate]):
    def get_by_type(
        self, 
        db: Session, 
        *, 
        facility_type: str, 
        tenant_id: int
    ) -> List[TblFacilities]:
        """Get facilities by type"""
        return db.query(TblFacilities).filter(
            and_(
                TblFacilities.type == facility_type,
                TblFacilities.tenant_id == tenant_id,
                TblFacilities.deleted == 0
            )
        ).all()

    def search_facilities(
        self,
        db: Session,
        *,
        tenant_id: int,
        search_term: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblFacilities]:
        """Search facilities by name or description"""
        return db.query(TblFacilities).filter(
            and_(
                TblFacilities.tenant_id == tenant_id,
                TblFacilities.deleted == 0,
                (TblFacilities.facility_name.contains(search_term) | 
                 TblFacilities.description.contains(search_term))
            )
        ).offset(skip).limit(limit).all()

    def get_by_name(
        self, 
        db: Session, 
        *, 
        facility_name: str, 
        tenant_id: int
    ) -> Optional[TblFacilities]:
        """Get facility by name"""
        return db.query(TblFacilities).filter(
            and_(
                TblFacilities.facility_name == facility_name,
                TblFacilities.tenant_id == tenant_id,
                TblFacilities.deleted == 0
            )
        ).first()


facility = CRUDFacility(TblFacilities)
