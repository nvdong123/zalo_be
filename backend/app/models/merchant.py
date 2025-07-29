from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class Merchant(SQLModel, table=True):
    __tablename__ = "merchant"
    id: Optional[int] = Field(default=None, primary_key=True)
    error: int = Field(default=0)
    message: str = Field(default="Successful")
    merchant_id: str = Field(index=True)
    name: str
    phone: Optional[str] = None
    zalo_id: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    status: str = Field(default="ACTIVE")
    visible_order: str = Field(default="ENABLE")
    oa: Optional[str] = None
    
    # Relationships - uncomment khi cần thiết
    # rooms: List["Room"] = Relationship(back_populates="merchant")
    # services: List["Service"] = Relationship(back_populates="merchant")
    # menu_categories: List["MenuCategory"] = Relationship(back_populates="merchant")
