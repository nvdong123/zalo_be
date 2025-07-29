from sqlmodel import SQLModel, Field
from typing import Optional

class RoomCharacter(SQLModel, table=True):
    __tablename__ = "room_character"

    id: Optional[int] = Field(default=None, primary_key=True)
    room_id: Optional[int] = Field(default=None, foreign_key="room.id")
