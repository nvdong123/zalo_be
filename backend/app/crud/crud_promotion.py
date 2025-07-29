from sqlmodel import Session, select
from app.models.promotion import Promotion
from app.schemas.promotion import PromotionCreate, PromotionUpdate
from typing import List, Optional

def get_promotions(db: Session, skip: int = 0, limit: int = 100) -> List[Promotion]:
    return db.exec(select(Promotion).offset(skip).limit(limit)).all()

def get_promotion(db: Session, promotion_id: int) -> Optional[Promotion]:
    return db.get(Promotion, promotion_id)

def create_promotion(db: Session, obj_in: PromotionCreate) -> Promotion:
    db_obj = Promotion(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_promotion(db: Session, db_obj: Promotion, obj_in: PromotionUpdate) -> Promotion:
    obj_data = obj_in.dict(exclude_unset=True)
    for field, value in obj_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_promotion(db: Session, promotion_id: int) -> None:
    db_obj = db.get(Promotion, promotion_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
