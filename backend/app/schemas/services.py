from pydantic import BaseModel
from typing import Optional
import datetime
import decimal

class ServiceBase(BaseModel):
    tenant_id: int
    service_name: str
    description: Optional[str] = None
    price: decimal.Decimal
    duration_minutes: int
    category: Optional[str] = None
    image_url: Optional[str] = None
    status: str = 'active'
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    deleted: Optional[int] = None
    deleted_at: Optional[datetime.datetime] = None
    deleted_by: Optional[str] = None

class ServiceCreate(ServiceBase):
    pass

class ServiceRead(ServiceBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class ServiceUpdate(ServiceBase):
    pass
