from pydantic import BaseModel
from typing import Optional

class OrderItemBase(BaseModel):
    order_id: Optional[int] = None
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

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemUpdate(BaseModel):
    order_id: Optional[int] = None
    item_id: Optional[int] = None
    product_id: Optional[int] = None
    name: Optional[str] = None
    price: Optional[float] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = None
    quantity: Optional[int] = None
    note: Optional[str] = None
    item_price: Optional[float] = None

class OrderItemInDBBase(OrderItemBase):
    id: int
    class Config:
        orm_mode = True

class OrderItem(OrderItemInDBBase):
    pass
