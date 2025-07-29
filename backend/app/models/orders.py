from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal

class Orders(SQLModel, table=True):
    __tablename__ = "orders"
    id: Optional[int] = Field(default=None, primary_key=True)
    error: int
    message: str
    order_id: int
    status: str
    created_at: int  # bigint in database
    total: Decimal  # decimal(10,2) in database
