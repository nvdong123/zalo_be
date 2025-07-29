from pydantic import BaseModel
from typing import Optional

class RoomTagBase(BaseModel):
    room_id: int
    tag: str

class RoomTagCreate(RoomTagBase):
    pass

class RoomTagUpdate(BaseModel):
    tag: Optional[str] = None
    room_id: Optional[int] = None

class RoomTagInDBBase(RoomTagBase):
    id: int

    class Config:
        orm_mode = True

class RoomTag(RoomTagInDBBase):
    pass
