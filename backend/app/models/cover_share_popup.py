from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class CoverSharePopup(SQLModel, table=True):
    __tablename__ = "cover_share_popup"
    id: Optional[int] = Field(default=None, primary_key=True)
    error: int
    message: str
    cover_url: str
    updated_at: datetime
