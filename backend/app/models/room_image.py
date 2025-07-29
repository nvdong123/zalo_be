from sqlmodel import SQLModel, Field
from typing import Optional

class RoomImage(SQLModel, table=True):
    __tablename__ = "room_image"

    id: Optional[int] = Field(default=None, primary_key=True)
    room_id: Optional[int] = Field(default=None, foreign_key="room.id")
    src: str
    alt: Optional[str] = None
    title: Optional[str] = None
