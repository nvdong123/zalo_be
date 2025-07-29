from sqlmodel import SQLModel, Field
from typing import Optional

class PromotionSuggest(SQLModel, table=True):
    __tablename__ = "promotion_suggest"
    id: Optional[int] = Field(default=None, primary_key=True)
    error: int
    message: str
    promotion_id: int
    title: str
    image_url: Optional[str] = None
