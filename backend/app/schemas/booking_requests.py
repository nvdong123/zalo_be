from pydantic import BaseModel
from typing import Optional
import datetime

class BookingRequestBase(BaseModel):
    tenant_id: int
    customer_id: int
    booking_date: datetime.date
    room_id: Optional[int] = None
    facility_id: Optional[int] = None
    mobile_number: Optional[str] = None
    check_in_date: Optional[datetime.date] = None
    check_out_date: Optional[datetime.date] = None
    note: Optional[str] = None
    request_channel: Optional[str] = None
    status: Optional[str] = None
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    deleted: Optional[int] = None
    deleted_at: Optional[datetime.datetime] = None
    deleted_by: Optional[str] = None

class BookingRequestCreate(BookingRequestBase):
    pass

class BookingRequestRead(BookingRequestBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class BookingRequestUpdate(BookingRequestBase):
    pass
