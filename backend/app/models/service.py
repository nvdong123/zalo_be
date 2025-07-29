from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class Service(SQLModel, table=True):
    __tablename__ = "service"
    id: Optional[int] = Field(default=None, primary_key=True)
    error: int = Field(default=0)
    message: str = Field(default="Successful")
    service_id: int
    name: str
    discount: Optional[str] = None
    rating: int
    type: str
    start_date: Optional[str] = None
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    
    # Thêm foreign key khi cần thiết
    # merchant_id: Optional[int] = Field(default=None, foreign_key="merchant.id")
    
    # Relationships
    # merchant: Optional["Merchant"] = Relationship(back_populates="services")
    # service_images: List["ServiceImage"] = Relationship(back_populates="service")
    # service_benefits: List["ServiceBenefit"] = Relationship(back_populates="service")
