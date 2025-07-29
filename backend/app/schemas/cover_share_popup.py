from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CoverSharePopupBase(BaseModel):
    error: int
    message: str
    cover_url: str
    updated_at: datetime

class CoverSharePopupCreate(CoverSharePopupBase):
    pass

class CoverSharePopupUpdate(BaseModel):
    error: Optional[int] = None
    message: Optional[str] = None
    cover_url: Optional[str] = None
    updated_at: Optional[datetime] = None

class CoverSharePopupInDBBase(CoverSharePopupBase):
    id: int
    class Config:
        orm_mode = True

class CoverSharePopup(CoverSharePopupInDBBase):
    pass
