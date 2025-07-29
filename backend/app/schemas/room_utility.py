from pydantic import BaseModel
from typing import Optional

class RoomUtilityBase(BaseModel):
    room_id: Optional[int] = None
    utility_id: int
    name: str
    type: str

class RoomUtilityCreate(RoomUtilityBase):
    pass

class RoomUtilityUpdate(BaseModel):
    room_id: Optional[int] = None
    utility_id: Optional[int] = None
    name: Optional[str] = None
    type: Optional[str] = None

class RoomUtilityInDBBase(RoomUtilityBase):
    id: int
    class Config:
        orm_mode = True

class RoomUtility(RoomUtilityInDBBase):
    pass
