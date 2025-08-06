from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.models.models import TblFacilityFeatures
from app.schemas.facility_features import FacilityFeatureCreate, FacilityFeatureUpdate


class CRUDFacilityFeature(CRUDBase[TblFacilityFeatures, FacilityFeatureCreate, FacilityFeatureUpdate]):
    def get_by_facility(
        self, 
        db: Session, 
        *, 
        facility_id: int,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblFacilityFeatures]:
        """Get features by facility"""
        return db.query(TblFacilityFeatures).filter(
            and_(
                TblFacilityFeatures.facility_id == facility_id,
                TblFacilityFeatures.tenant_id == tenant_id,
                TblFacilityFeatures.deleted == 0
            )
        ).offset(skip).limit(limit).all()

    def get_by_feature_type(
        self,
        db: Session,
        *,
        feature_type: str,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblFacilityFeatures]:
        """Get facility features by type"""
        return db.query(TblFacilityFeatures).filter(
            and_(
                TblFacilityFeatures.feature_type == feature_type,
                TblFacilityFeatures.tenant_id == tenant_id,
                TblFacilityFeatures.deleted == 0
            )
        ).offset(skip).limit(limit).all()


facility_feature = CRUDFacilityFeature(TblFacilityFeatures)
