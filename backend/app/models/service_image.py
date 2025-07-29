from sqlmodel import SQLModel, Field
from typing import Optional

class ServiceImage(SQLModel, table=True):
    __tablename__ = "service_image"

    id: Optional[int] = Field(default=None, primary_key=True)
    service_id: Optional[int] = Field(default=None, foreign_key="service.id")
    image_url: str
