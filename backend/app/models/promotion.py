from sqlmodel import SQLModel, Field
from typing import Optional

class Promotion(SQLModel, table=True):
    __tablename__ = "promotion"
    id: Optional[int] = Field(default=None, primary_key=True)
    error: int
    message: str
    promotion_id: int
    title: str
    type: str
    image_url: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    time_remaining: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[int] = None
    suggest: bool  # tinyint(1) = boolean
