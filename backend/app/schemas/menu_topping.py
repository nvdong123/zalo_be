from pydantic import BaseModel
from typing import Optional

class MenuToppingBase(BaseModel):
    product_id: Optional[int] = None
    topping_id: int
    name: str
    price: float
    status: str

class MenuToppingCreate(MenuToppingBase):
    pass

class MenuToppingUpdate(BaseModel):
    product_id: Optional[int] = None
    topping_id: Optional[int] = None
    name: Optional[str] = None
    price: Optional[float] = None
    status: Optional[str] = None

class MenuToppingInDBBase(MenuToppingBase):
    id: int
    class Config:
        orm_mode = True

class MenuTopping(MenuToppingInDBBase):
    pass
