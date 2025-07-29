from sqlmodel import SQLModel, Field
from typing import Optional

class OrderItem(SQLModel, table=True):
    __tablename__ = "order_item"

    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: Optional[int] = Field(default=None, foreign_key="orders.id")
    item_id: int
    product_id: int
    name: str
    price: float
    sku: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: str
    quantity: int
    note: Optional[str] = None
    item_price: float
