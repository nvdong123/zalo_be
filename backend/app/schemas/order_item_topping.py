from pydantic import BaseModel
from typing import Optional

class OrderItemToppingBase(BaseModel):
    order_item_id: Optional[int] = None
    topping_id: int
    name: str
    price: float
    status: str

class OrderItemToppingCreate(OrderItemToppingBase):
    pass

class OrderItemToppingUpdate(BaseModel):
    order_item_id: Optional[int] = None
    topping_id: Optional[int] = None
    name: Optional[str] = None
    price: Optional[float] = None
    status: Optional[str] = None

class OrderItemToppingInDBBase(OrderItemToppingBase):
    id: int
    class Config:
        orm_mode = True

class OrderItemTopping(OrderItemToppingInDBBase):
    pass
