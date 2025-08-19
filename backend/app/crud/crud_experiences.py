from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.models.models import TblExperiences
from app.schemas.experiences import ExperienceCreate, ExperienceUpdate


class CRUDExperience(CRUDBase[TblExperiences, ExperienceCreate, ExperienceUpdate]):
    def get_by_type(self, db: Session, *, type: str, tenant_id: int) -> List[TblExperiences]:
        """Get experiences by type and tenant"""
        return db.query(self.model).filter(
            and_(
                self.model.type == type,
                self.model.tenant_id == tenant_id,
                self.model.deleted == 0
            )
        ).all()

    def get_by_tenant(self, db: Session, *, tenant_id: int, skip: int = 0, limit: int = 100) -> List[TblExperiences]:
        """Get all experiences for a tenant"""
        return db.query(self.model).filter(
            and_(
                self.model.tenant_id == tenant_id,
                self.model.deleted == 0
            )
        ).offset(skip).limit(limit).all()


experience = CRUDExperience(TblExperiences)
