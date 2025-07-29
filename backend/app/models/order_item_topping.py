from sqlmodel import SQLModel, Field
from typing import Optional

class OrderItemTopping(SQLModel, table=True):
    __tablename__ = "order_item_topping"

    id: Optional[int] = Field(default=None, primary_key=True)
    order_item_id: Optional[int] = Field(default=None, foreign_key="order_item.id")
    topping_id: int
    name: str
    price: float
    status: str
