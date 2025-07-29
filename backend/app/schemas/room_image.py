from pydantic import BaseModel
from typing import Optional

class RoomImageBase(BaseModel):
    room_id: Optional[int] = None
    src: str
    alt: Optional[str] = None
    title: Optional[str] = None

class RoomImageCreate(RoomImageBase):
    pass

class RoomImageUpdate(BaseModel):
    room_id: Optional[int] = None
    src: Optional[str] = None
    alt: Optional[str] = None
    title: Optional[str] = None

class RoomImageInDBBase(RoomImageBase):
    id: int
    class Config:
        orm_mode = True

class RoomImage(RoomImageInDBBase):
    pass
