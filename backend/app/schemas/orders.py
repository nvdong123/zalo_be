from pydantic import BaseModel
from typing import Optional

class OrdersBase(BaseModel):
    error: int
    message: str
    order_id: int
    status: str
    created_at: int
    total: float

class OrdersCreate(OrdersBase):
    pass

class OrdersUpdate(BaseModel):
    error: Optional[int] = None
    message: Optional[str] = None
    order_id: Optional[int] = None
    status: Optional[str] = None
    created_at: Optional[int] = None
    total: Optional[float] = None

class OrdersInDBBase(OrdersBase):
    id: int
    class Config:
        orm_mode = True

class Orders(OrdersInDBBase):
    pass
