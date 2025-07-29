from pydantic import BaseModel
from typing import Optional

class MenuProductBase(BaseModel):
    category_id: Optional[int] = None
    product_id: int
    name: str
    price: float
    sku: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: str

class MenuProductCreate(MenuProductBase):
    pass

class MenuProductUpdate(BaseModel):
    category_id: Optional[int] = None
    product_id: Optional[int] = None
    name: Optional[str] = None
    price: Optional[float] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = None

class MenuProductInDBBase(MenuProductBase):
    id: int
    class Config:
        orm_mode = True

class MenuProduct(MenuProductInDBBase):
    pass
