from pydantic import BaseModel
from typing import Optional

class OABase(BaseModel):
    error: int
    message: str
    oa_id: str
    name: str
    avatar_url: Optional[str] = None
    cover_url: Optional[str] = None
    phone: Optional[str] = None
    prompt: Optional[str] = None
    direction_link: Optional[str] = None
    followed: int

class OACreate(OABase):
    pass

class OAUpdate(BaseModel):
    error: Optional[int] = None
    message: Optional[str] = None
    oa_id: Optional[str] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    cover_url: Optional[str] = None
    phone: Optional[str] = None
    prompt: Optional[str] = None
    direction_link: Optional[str] = None
    followed: Optional[int] = None

class OAInDBBase(OABase):
    id: int
    class Config:
        orm_mode = True

class OA(OAInDBBase):
    pass
