from pydantic import BaseModel
from typing import Optional

class ButtonNameBase(BaseModel):
    error: int
    message: str
    merchant_video: Optional[str] = None
    merchant_vr360: Optional[str] = None
    merchant_promotion: Optional[str] = None
    merchant_follow_oa: Optional[str] = None
    merchant_more: Optional[str] = None
    tab_callnow: Optional[str] = None
    tab_promotion: Optional[str] = None
    tab_homepage: Optional[str] = None
    tab_inbox: Optional[str] = None
    tab_direction: Optional[str] = None
    promotion_sort: Optional[str] = None
    promotion_follow_oa: Optional[str] = None
    promotion_get_promotion: Optional[str] = None
    booking_vr360: Optional[str] = None
    booking_video: Optional[str] = None
    booking_booking: Optional[str] = None
    luckywheel_spin: Optional[str] = None
    service_bookingnow: Optional[str] = None

class ButtonNameCreate(ButtonNameBase):
    pass

class ButtonNameRead(ButtonNameBase):
    id: int

class ButtonNameUpdate(BaseModel):
    error: Optional[int] = None
    message: Optional[str] = None
    merchant_video: Optional[str] = None
    merchant_vr360: Optional[str] = None
    merchant_promotion: Optional[str] = None
    merchant_follow_oa: Optional[str] = None
    merchant_more: Optional[str] = None
    tab_callnow: Optional[str] = None
    tab_promotion: Optional[str] = None
    tab_homepage: Optional[str] = None
    tab_inbox: Optional[str] = None
    tab_direction: Optional[str] = None
    promotion_sort: Optional[str] = None
    promotion_follow_oa: Optional[str] = None
    promotion_get_promotion: Optional[str] = None
    booking_vr360: Optional[str] = None
    booking_video: Optional[str] = None
    booking_booking: Optional[str] = None
    luckywheel_spin: Optional[str] = None
    service_bookingnow: Optional[str] = None
