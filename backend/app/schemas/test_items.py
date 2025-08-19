from typing import Optional
from pydantic import BaseModel

# Base schema for TestItem
class TestItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    status: str = "active"

# Schema for creating a TestItem
class TestItemCreate(TestItemBase):
    pass

# Schema for updating a TestItem
class TestItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    status: Optional[str] = None

# Schema for reading a TestItem (response)
class TestItemRead(TestItemBase):
    id: int
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
