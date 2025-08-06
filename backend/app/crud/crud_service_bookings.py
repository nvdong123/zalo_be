from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.models.models import TblServiceBookings
from app.schemas.service_bookings import ServiceBookingCreate, ServiceBookingUpdate


class CRUDServiceBooking(CRUDBase[TblServiceBookings, ServiceBookingCreate, ServiceBookingUpdate]):
    def get_by_customer(
        self, 
        db: Session, 
        *, 
        customer_id: int,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblServiceBookings]:
        """Get service bookings by customer"""
        return db.query(TblServiceBookings).filter(
            and_(
                TblServiceBookings.customer_id == customer_id,
                TblServiceBookings.tenant_id == tenant_id,
                TblServiceBookings.deleted == 0
            )
        ).offset(skip).limit(limit).all()

    def get_by_service(
        self,
        db: Session,
        *,
        service_id: int,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblServiceBookings]:
        """Get bookings by service"""
        return db.query(TblServiceBookings).filter(
            and_(
                TblServiceBookings.service_id == service_id,
                TblServiceBookings.tenant_id == tenant_id,
                TblServiceBookings.deleted == 0
            )
        ).offset(skip).limit(limit).all()

    def get_by_status(
        self,
        db: Session,
        *,
        status: str,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblServiceBookings]:
        """Get service bookings by status"""
        return db.query(TblServiceBookings).filter(
            and_(
                TblServiceBookings.status == status,
                TblServiceBookings.tenant_id == tenant_id,
                TblServiceBookings.deleted == 0
            )
        ).offset(skip).limit(limit).all()


service_booking = CRUDServiceBooking(TblServiceBookings)
