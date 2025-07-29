from sqlmodel import SQLModel, Field
from typing import Optional

class MenuProduct(SQLModel, table=True):
    __tablename__ = "menu_product"

    id: Optional[int] = Field(default=None, primary_key=True)
    category_id: Optional[int] = Field(default=None, foreign_key="menu_category.id")
    product_id: int
    name: str
    price: float
    sku: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: str
