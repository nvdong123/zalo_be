from pydantic import BaseModel
from typing import Optional, List
import datetime

class ExperienceBase(BaseModel):
    tenant_id: int
    type: str
    images: Optional[List[str]] = None
    title: Optional[str] = None
    description: Optional[List[str]] = None
    vr360_url: Optional[str] = None
    video_url: Optional[str] = None
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    deleted: Optional[int] = None
    deleted_at: Optional[datetime.datetime] = None
    deleted_by: Optional[str] = None

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceRead(ExperienceBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class ExperienceUpdate(ExperienceBase):
    pass
