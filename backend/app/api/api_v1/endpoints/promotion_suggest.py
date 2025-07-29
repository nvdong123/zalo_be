from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.promotion_suggest import PromotionSuggest, PromotionSuggestCreate, PromotionSuggestUpdate
from app.crud.crud_promotion_suggest import (
    get_promotion_suggests,
    get_promotion_suggest,
    create_promotion_suggest,
    update_promotion_suggest,
    delete_promotion_suggest,
)
from app.db.session import get_db

router = APIRouter()

@router.get("/promotion_suggest/", response_model=List[PromotionSuggest])
def read_promotion_suggests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_promotion_suggests(db, skip=skip, limit=limit)

@router.get("/promotion_suggest/{promotion_suggest_id}", response_model=PromotionSuggest)
def read_promotion_suggest(promotion_suggest_id: int, db: Session = Depends(get_db)):
    db_obj = get_promotion_suggest(db, promotion_suggest_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="PromotionSuggest not found")
    return db_obj

@router.post("/promotion_suggest/", response_model=PromotionSuggest)
def create_promotion_suggest_view(obj_in: PromotionSuggestCreate, db: Session = Depends(get_db)):
    return create_promotion_suggest(db, obj_in)

@router.put("/promotion_suggest/{promotion_suggest_id}", response_model=PromotionSuggest)
def update_promotion_suggest_view(promotion_suggest_id: int, obj_in: PromotionSuggestUpdate, db: Session = Depends(get_db)):
    db_obj = get_promotion_suggest(db, promotion_suggest_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="PromotionSuggest not found")
    return update_promotion_suggest(db, db_obj, obj_in)

@router.delete("/promotion_suggest/{promotion_suggest_id}")
def delete_promotion_suggest_view(promotion_suggest_id: int, db: Session = Depends(get_db)):
    delete_promotion_suggest(db, promotion_suggest_id)
    return {"ok": True}
