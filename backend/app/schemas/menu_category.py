from typing import Optional
from pydantic import BaseModel

class MenuCategoryBase(BaseModel):
    error: int
    message: str
    category_id: int
    category_name: str
    category_description: Optional[str] = None
    merchant_id: int
    category_status: str
    created_at: Optional[str] = None

class MenuCategoryCreate(MenuCategoryBase):
    pass

class MenuCategoryUpdate(BaseModel):
    error: Optional[int] = None
    message: Optional[str] = None
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    category_description: Optional[str] = None
    merchant_id: Optional[int] = None
    category_status: Optional[str] = None
    created_at: Optional[str] = None

class MenuCategoryRead(MenuCategoryBase):
    id: int
