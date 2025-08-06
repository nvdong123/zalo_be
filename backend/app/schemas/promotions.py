from pydantic import BaseModel
from typing import Optional
import datetime

class PromotionBase(BaseModel):
    tenant_id: int
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime.date] = None
    end_date: Optional[datetime.date] = None
    banner_image: Optional[str] = None
    status: Optional[str] = None
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    deleted: Optional[int] = None
    deleted_at: Optional[datetime.datetime] = None
    deleted_by: Optional[str] = None

class PromotionCreate(PromotionBase):
    pass

class PromotionRead(PromotionBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class PromotionUpdate(PromotionBase):
    pass
