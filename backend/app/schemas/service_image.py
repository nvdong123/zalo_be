from pydantic import BaseModel
from typing import Optional

class ServiceImageBase(BaseModel):
    service_id: Optional[int] = None
    image_url: str

class ServiceImageCreate(ServiceImageBase):
    pass

class ServiceImageUpdate(BaseModel):
    service_id: Optional[int] = None
    image_url: Optional[str] = None

class ServiceImageInDBBase(ServiceImageBase):
    id: int
    class Config:
        orm_mode = True

class ServiceImage(ServiceImageInDBBase):
    pass
