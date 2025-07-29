from pydantic import BaseModel
from typing import Optional

class PromotionBase(BaseModel):
    error: int
    message: str
    promotion_id: int
    title: str
    type: str
    image_url: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    time_remaining: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[int] = None
    suggest: int

class PromotionCreate(PromotionBase):
    pass

class PromotionUpdate(BaseModel):
    error: Optional[int] = None
    message: Optional[str] = None
    promotion_id: Optional[int] = None
    title: Optional[str] = None
    type: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    time_remaining: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[int] = None
    suggest: Optional[int] = None

class PromotionInDBBase(PromotionBase):
    id: int
    class Config:
        orm_mode = True

class Promotion(PromotionInDBBase):
    pass
