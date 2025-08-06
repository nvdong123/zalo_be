from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Base schema for AdminUser
class AdminUserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    role: str
    tenant_id: int
    is_active: bool = True

# Schema for creating AdminUser
class AdminUserCreate(AdminUserBase):
    password: str

# Schema for updating AdminUser
class AdminUserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

# Schema for AdminUser response (without password)
class AdminUserResponse(AdminUserBase):
    id: int
    created_date: datetime
    updated_date: Optional[datetime] = None

    class Config:
        from_attributes = True

# Schema for AdminUser in database
class AdminUserInDB(AdminUserResponse):
    hashed_password: str

# Schema for login
class AdminUserLogin(BaseModel):
    username: str
    password: str

# Schema for token response
class Token(BaseModel):
    access_token: str
    token_type: str

# Schema for token data
class TokenData(BaseModel):
    username: Optional[str] = None
    tenant_id: Optional[int] = None
