from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime

class MerchantBase(BaseModel):
    error: int = 0
    message: str = "Successful"
    merchant_id: str
    name: str
    phone: Optional[str] = None
    zalo_id: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    status: str = "ACTIVE"
    visible_order: str = "ENABLE"
    oa: Optional[str] = None

    @validator('email')
    def email_must_be_valid(cls, v):
        if v is not None and '@' not in v:
            raise ValueError('email không hợp lệ')
        return v
    
    @validator('phone')
    def phone_must_be_valid(cls, v):
        if v is not None and v.strip():
            # Remove spaces and check if all remaining characters are digits
            phone_digits = ''.join(v.split())
            if not phone_digits.isdigit():
                raise ValueError('phone phải là số')
        return v

class MerchantCreate(MerchantBase):
    pass

class MerchantUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    zalo_id: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    status: Optional[str] = None
    visible_order: Optional[str] = None
    oa: Optional[str] = None
    tax_id: Optional[str] = None
    currency: Optional[str] = None
    timezone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    status: Optional[str] = None
    visible_order: Optional[str] = None
    oa: Optional[str] = None

class MerchantInDBBase(MerchantBase):
    id: int
    class Config:
        from_attributes = True  # Pydantic V2

class Merchant(MerchantInDBBase):
    pass
