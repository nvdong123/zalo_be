from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class Room(SQLModel, table=True):
    __tablename__ = "room"

    id: Optional[int] = Field(default=None, primary_key=True)
    error: int = Field(default=0)
    message: str = Field(default="Successful")
    room_id: int
    name: str
    price: str
    introduction: Optional[str] = None
    vr_url: Optional[str] = None
    video_url: Optional[str] = None
    
    # Thêm foreign key khi cần thiết
    # merchant_id: Optional[int] = Field(default=None, foreign_key="merchant.id")
    
    # Relationships
    # merchant: Optional["Merchant"] = Relationship(back_populates="rooms")
    # room_images: List["RoomImage"] = Relationship(back_populates="room")
    # room_characters: List["RoomCharacter"] = Relationship(back_populates="room")
