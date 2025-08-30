from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.models.models import TblPromotions
from app.schemas.promotions import PromotionCreate, PromotionUpdate


class CRUDPromotion(CRUDBase[TblPromotions, PromotionCreate, PromotionUpdate]):
    def get_by_title(
        self, 
        db: Session, 
        *, 
        title: str,
        tenant_id: int
    ) -> Optional[TblPromotions]:
        """Get promotion by title"""
        return db.query(TblPromotions).filter(
            and_(
                TblPromotions.title == title,
                TblPromotions.tenant_id == tenant_id,
                TblPromotions.deleted == 0
            )
        ).first()

    def get_active_promotions(
        self,
        db: Session,
        *,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblPromotions]:
        """Get active promotions"""
        return db.query(TblPromotions).filter(
            and_(
                TblPromotions.status == 'active',
                TblPromotions.tenant_id == tenant_id,
                TblPromotions.deleted == 0
            )
        ).offset(skip).limit(limit).all()

    def get_by_status(
        self,
        db: Session,
        *,
        status: str,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblPromotions]:
        """Get promotions by status"""
        return db.query(TblPromotions).filter(
            and_(
                TblPromotions.status == status,
                TblPromotions.tenant_id == tenant_id,
                TblPromotions.deleted == 0
            )
        ).offset(skip).limit(limit).all()


promotion = CRUDPromotion(TblPromotions)
