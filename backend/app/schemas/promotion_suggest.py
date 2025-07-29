from pydantic import BaseModel
from typing import Optional

class PromotionSuggestBase(BaseModel):
    error: int
    message: str
    promotion_id: int
    title: str
    image_url: Optional[str] = None

class PromotionSuggestCreate(PromotionSuggestBase):
    pass

class PromotionSuggestUpdate(BaseModel):
    error: Optional[int] = None
    message: Optional[str] = None
    promotion_id: Optional[int] = None
    title: Optional[str] = None
    image_url: Optional[str] = None

class PromotionSuggestInDBBase(PromotionSuggestBase):
    id: int
    class Config:
        orm_mode = True

class PromotionSuggest(PromotionSuggestInDBBase):
    pass
