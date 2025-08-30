from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.models.models import TblExperiences
from app.schemas.experiences import ExperienceCreate, ExperienceUpdate


class CRUDExperience(CRUDBase[TblExperiences, ExperienceCreate, ExperienceUpdate]):
    def get_by_type(
        self, 
        db: Session, 
        *, 
        experience_type: str,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblExperiences]:
        """Get experiences by type for a tenant"""
        return db.query(TblExperiences).filter(
            and_(
                TblExperiences.type == experience_type,
                TblExperiences.tenant_id == tenant_id,
                TblExperiences.deleted == 0
            )
        ).offset(skip).limit(limit).all()

    def get_active_by_tenant(
        self, 
        db: Session, 
        *, 
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblExperiences]:
        """Get active experiences for a tenant"""
        return db.query(TblExperiences).filter(
            and_(
                TblExperiences.tenant_id == tenant_id,
                TblExperiences.status == 'active',
                TblExperiences.deleted == 0
            )
        ).offset(skip).limit(limit).all()


experience = CRUDExperience(TblExperiences)
