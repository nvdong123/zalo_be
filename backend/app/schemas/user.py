from typing import Optional, List
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False
    merchant_id: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserListResponse(BaseModel):
    data: List[UserRead]
    total: int
