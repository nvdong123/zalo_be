from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.models.models import TblRoomFeatures
from app.schemas.room_features import RoomFeatureCreate, RoomFeatureUpdate


class CRUDRoomFeature(CRUDBase[TblRoomFeatures, RoomFeatureCreate, RoomFeatureUpdate]):
    def get_by_room(
        self, 
        db: Session, 
        *, 
        room_id: int,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblRoomFeatures]:
        """Get features by room"""
        return db.query(TblRoomFeatures).filter(
            and_(
                TblRoomFeatures.room_id == room_id,
                TblRoomFeatures.tenant_id == tenant_id,
                TblRoomFeatures.deleted == 0
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
    ) -> List[TblRoomFeatures]:
        """Get room features by type"""
        return db.query(TblRoomFeatures).filter(
            and_(
                TblRoomFeatures.feature_type == feature_type,
                TblRoomFeatures.tenant_id == tenant_id,
                TblRoomFeatures.deleted == 0
            )
        ).offset(skip).limit(limit).all()


room_feature = CRUDRoomFeature(TblRoomFeatures)
