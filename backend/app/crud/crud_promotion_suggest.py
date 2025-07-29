from sqlmodel import Session, select
from app.models.promotion_suggest import PromotionSuggest
from app.schemas.promotion_suggest import PromotionSuggestCreate, PromotionSuggestUpdate
from typing import List, Optional

def get_promotion_suggests(db: Session, skip: int = 0, limit: int = 100) -> List[PromotionSuggest]:
    return db.exec(select(PromotionSuggest).offset(skip).limit(limit)).all()

def get_promotion_suggest(db: Session, promotion_suggest_id: int) -> Optional[PromotionSuggest]:
    return db.get(PromotionSuggest, promotion_suggest_id)

def create_promotion_suggest(db: Session, obj_in: PromotionSuggestCreate) -> PromotionSuggest:
    db_obj = PromotionSuggest(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_promotion_suggest(db: Session, db_obj: PromotionSuggest, obj_in: PromotionSuggestUpdate) -> PromotionSuggest:
    obj_data = obj_in.dict(exclude_unset=True)
    for field, value in obj_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_promotion_suggest(db: Session, promotion_suggest_id: int) -> None:
    db_obj = db.get(PromotionSuggest, promotion_suggest_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
