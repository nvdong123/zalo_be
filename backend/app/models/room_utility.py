from sqlmodel import SQLModel, Field
from typing import Optional

class RoomUtility(SQLModel, table=True):
    __tablename__ = "room_utility"

    id: Optional[int] = Field(default=None, primary_key=True)
    room_id: Optional[int] = Field(default=None, foreign_key="room.id")
    utility_id: int
    name: str
    type: str
