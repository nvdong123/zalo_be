from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.models.models import TblRoomStays
from app.schemas.room_stays import RoomStayCreate, RoomStayUpdate


class CRUDRoomStay(CRUDBase[TblRoomStays, RoomStayCreate, RoomStayUpdate]):
    def get_by_customer(
        self, 
        db: Session, 
        *, 
        customer_id: int,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblRoomStays]:
        """Get room stays by customer"""
        return db.query(TblRoomStays).filter(
            and_(
                TblRoomStays.customer_id == customer_id,
                TblRoomStays.tenant_id == tenant_id,
                TblRoomStays.deleted == 0
            )
        ).offset(skip).limit(limit).all()

    def get_by_room(
        self,
        db: Session,
        *,
        room_id: int,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblRoomStays]:
        """Get room stays by room"""
        return db.query(TblRoomStays).filter(
            and_(
                TblRoomStays.room_id == room_id,
                TblRoomStays.tenant_id == tenant_id,
                TblRoomStays.deleted == 0
            )
        ).offset(skip).limit(limit).all()

    def get_active_stays(
        self,
        db: Session,
        *,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblRoomStays]:
        """Get active room stays"""
        return db.query(TblRoomStays).filter(
            and_(
                TblRoomStays.status == "active",
                TblRoomStays.tenant_id == tenant_id,
                TblRoomStays.deleted == 0
            )
        ).offset(skip).limit(limit).all()


room_stay = CRUDRoomStay(TblRoomStays)
