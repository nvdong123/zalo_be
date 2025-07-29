from sqlmodel import SQLModel, Field
from typing import Optional

class RoomTag(SQLModel, table=True):
    __tablename__ = "room_tag"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    room_id: int = Field(foreign_key="room.id")
    tag: str = Field(max_length=255)
