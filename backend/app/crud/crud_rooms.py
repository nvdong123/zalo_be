from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from app.crud.base import CRUDBase
from app.models.models import TblRooms
from app.schemas.rooms import RoomCreate, RoomUpdate


class CRUDRoom(CRUDBase[TblRooms, RoomCreate, RoomUpdate]):
    def get_by_room_type(
        self, 
        db: Session, 
        *, 
        room_type: str, 
        tenant_id: int
    ) -> List[TblRooms]:
        """Get rooms by type"""
        return db.query(TblRooms).filter(
            and_(
                TblRooms.room_type == room_type,
                TblRooms.tenant_id == tenant_id,
                TblRooms.deleted == 0
            )
        ).all()

    def get_available_rooms(
        self,
        db: Session,
        *,
        tenant_id: int,
        capacity_adults: int = None,
        capacity_children: int = None
    ) -> List[TblRooms]:
        """Get available rooms based on capacity"""
        query = db.query(TblRooms).filter(
            and_(
                TblRooms.tenant_id == tenant_id,
                TblRooms.deleted == 0
            )
        )
        
        if capacity_adults:
            query = query.filter(TblRooms.capacity_adults >= capacity_adults)
            
        if capacity_children:
            query = query.filter(TblRooms.capacity_children >= capacity_children)
            
        return query.all()

    def search_rooms(
        self,
        db: Session,
        *,
        tenant_id: int,
        search_term: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblRooms]:
        """Search rooms by name or description"""
        return db.query(TblRooms).filter(
            and_(
                TblRooms.tenant_id == tenant_id,
                TblRooms.deleted == 0,
                (TblRooms.room_name.contains(search_term) | 
                 TblRooms.description.contains(search_term))
            )
        ).offset(skip).limit(limit).all()


room = CRUDRoom(TblRooms)
