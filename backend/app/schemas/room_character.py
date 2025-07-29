from pydantic import BaseModel
from typing import Optional

class RoomCharacterBase(BaseModel):
    room_id: Optional[int] = None

class RoomCharacterCreate(RoomCharacterBase):
    pass

class RoomCharacterUpdate(BaseModel):
    room_id: Optional[int] = None

class RoomCharacterInDBBase(RoomCharacterBase):
    id: int
    class Config:
        orm_mode = True

class RoomCharacter(RoomCharacterInDBBase):
    pass
