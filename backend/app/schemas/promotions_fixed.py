from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

# Base promotion schema
class PromotionBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    banner_image: Optional[str] = None
    status: Optional[str] = 'active'

# Schema for creating promotion (request from user)
class PromotionCreateRequest(PromotionBase):
    title: str
    start_date: date
    end_date: date

# Schema for creating promotion (with additional fields)
class PromotionCreate(PromotionBase):
    tenant_id: int
    created_by: Optional[str] = None

# Schema for updating promotion (request from user)
class PromotionUpdateRequest(PromotionBase):
    pass

# Schema for updating promotion (with additional fields)
class PromotionUpdate(PromotionBase):
    updated_by: Optional[str] = None

# Schema for reading promotion
class PromotionRead(PromotionBase):
    id: int
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    deleted: int

    class Config:
        from_attributes = True
