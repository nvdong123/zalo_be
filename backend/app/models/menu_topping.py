from sqlmodel import SQLModel, Field
from typing import Optional

class MenuTopping(SQLModel, table=True):
    __tablename__ = "menu_topping"
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: Optional[int] = Field(default=None, foreign_key="menu_product.id")
    topping_id: int
    name: str
    price: float
    status: str
