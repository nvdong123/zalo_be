from pydantic import BaseModel
from typing import Optional
import datetime

class GameBase(BaseModel):
    tenant_id: int
    game_name: Optional[str] = None
    configurations: Optional[str] = None
    status: Optional[str] = None
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    deleted: Optional[int] = None
    deleted_at: Optional[datetime.datetime] = None
    deleted_by: Optional[str] = None

class GameCreate(GameBase):
    pass

class GameRead(GameBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class GameUpdate(GameBase):
    pass
