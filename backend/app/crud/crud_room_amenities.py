from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.models.models import TblRoomAmenities
from app.schemas.room_amenities import RoomAmenityCreate, RoomAmenityUpdate


class CRUDRoomAmenity(CRUDBase[TblRoomAmenities, RoomAmenityCreate, RoomAmenityUpdate]):
    def get_by_room(
        self, 
        db: Session, 
        *, 
        room_id: int,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblRoomAmenities]:
        """Get amenities by room"""
        return db.query(TblRoomAmenities).filter(
            and_(
                TblRoomAmenities.room_id == room_id,
                TblRoomAmenities.tenant_id == tenant_id,
                TblRoomAmenities.deleted == 0
            )
        ).offset(skip).limit(limit).all()

    def get_by_amenity_type(
        self,
        db: Session,
        *,
        amenity_type: str,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblRoomAmenities]:
        """Get room amenities by type"""
        return db.query(TblRoomAmenities).filter(
            and_(
                TblRoomAmenities.amenity_type == amenity_type,
                TblRoomAmenities.tenant_id == tenant_id,
                TblRoomAmenities.deleted == 0
            )
        ).offset(skip).limit(limit).all()


room_amenity = CRUDRoomAmenity(TblRoomAmenities)
