from pydantic import BaseModel
from typing import Optional

class RoomBase(BaseModel):
    error: int
    message: str
    room_id: int
    name: str
    price: str
    introduction: Optional[str] = None
    vr_url: Optional[str] = None
    video_url: Optional[str] = None

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    error: Optional[int] = None
    message: Optional[str] = None
    room_id: Optional[int] = None
    name: Optional[str] = None
    price: Optional[str] = None
    introduction: Optional[str] = None
    vr_url: Optional[str] = None
    video_url: Optional[str] = None

class RoomInDBBase(RoomBase):
    id: int
    class Config:
        orm_mode = True

class Room(RoomInDBBase):
    pass
