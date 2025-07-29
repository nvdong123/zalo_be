from pydantic import BaseModel
from typing import Optional

class ServiceBase(BaseModel):
    error: int
    message: str
    service_id: int
    name: str
    discount: Optional[str] = None
    rating: int
    type: str
    start_date: Optional[str] = None
    description: Optional[str] = None
    thumbnail: Optional[str] = None

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    error: Optional[int] = None
    message: Optional[str] = None
    service_id: Optional[int] = None
    name: Optional[str] = None
    discount: Optional[str] = None
    rating: Optional[int] = None
    type: Optional[str] = None
    start_date: Optional[str] = None
    description: Optional[str] = None
    thumbnail: Optional[str] = None

class ServiceInDBBase(ServiceBase):
    id: int
    class Config:
        orm_mode = True

class Service(ServiceInDBBase):
    pass
