from sqlmodel import SQLModel, Field
from typing import Optional

class MenuCategory(SQLModel, table=True):
    __tablename__ = "menu_category"
    id: Optional[int] = Field(default=None, primary_key=True)
    error: int
    message: str
    category_id: int
    category_name: str
    category_description: Optional[str] = None
    merchant_id: int
    category_status: str
    created_at: Optional[str] = None
