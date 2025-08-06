from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.models.models import TblBookingRequests
from app.schemas.booking_requests import BookingRequestCreate, BookingRequestUpdate


class CRUDBookingRequest(CRUDBase[TblBookingRequests, BookingRequestCreate, BookingRequestUpdate]):
    def get_by_customer(
        self, 
        db: Session, 
        *, 
        customer_id: int,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblBookingRequests]:
        """Get booking requests by customer"""
        return db.query(TblBookingRequests).filter(
            and_(
                TblBookingRequests.customer_id == customer_id,
                TblBookingRequests.tenant_id == tenant_id,
                TblBookingRequests.deleted == 0
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
    ) -> List[TblBookingRequests]:
        """Get booking requests by status"""
        return db.query(TblBookingRequests).filter(
            and_(
                TblBookingRequests.status == status,
                TblBookingRequests.tenant_id == tenant_id,
                TblBookingRequests.deleted == 0
            )
        ).offset(skip).limit(limit).all()

    def get_pending_requests(
        self,
        db: Session,
        *,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblBookingRequests]:
        """Get pending booking requests"""
        return db.query(TblBookingRequests).filter(
            and_(
                TblBookingRequests.status == "pending",
                TblBookingRequests.tenant_id == tenant_id,
                TblBookingRequests.deleted == 0
            )
        ).offset(skip).limit(limit).all()


booking_request = CRUDBookingRequest(TblBookingRequests)
