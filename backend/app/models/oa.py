from sqlmodel import SQLModel, Field
from typing import Optional

class OA(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    error: int
    message: str
    oa_id: str
    name: str
    avatar_url: Optional[str] = None
    cover_url: Optional[str] = None
    phone: Optional[str] = None
    prompt: Optional[str] = None
    direction_link: Optional[str] = None
    followed: int
