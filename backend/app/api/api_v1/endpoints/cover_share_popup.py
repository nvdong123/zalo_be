from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.cover_share_popup import CoverSharePopup, CoverSharePopupCreate, CoverSharePopupUpdate
from app.crud.crud_cover_share_popup import (
    get_cover_share_popups,
    get_cover_share_popup,
    create_cover_share_popup,
    update_cover_share_popup,
    delete_cover_share_popup,
)
from app.db.session import get_db

router = APIRouter()

@router.get("/cover_share_popup/", response_model=List[CoverSharePopup])
def read_cover_share_popups(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_cover_share_popups(db, skip=skip, limit=limit)

@router.get("/cover_share_popup/{cover_share_popup_id}", response_model=CoverSharePopup)
def read_cover_share_popup(cover_share_popup_id: int, db: Session = Depends(get_db)):
    db_obj = get_cover_share_popup(db, cover_share_popup_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="CoverSharePopup not found")
    return db_obj

@router.post("/cover_share_popup/", response_model=CoverSharePopup)
def create_cover_share_popup_view(obj_in: CoverSharePopupCreate, db: Session = Depends(get_db)):
    return create_cover_share_popup(db, obj_in)

@router.put("/cover_share_popup/{cover_share_popup_id}", response_model=CoverSharePopup)
def update_cover_share_popup_view(cover_share_popup_id: int, obj_in: CoverSharePopupUpdate, db: Session = Depends(get_db)):
    db_obj = get_cover_share_popup(db, cover_share_popup_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="CoverSharePopup not found")
    return update_cover_share_popup(db, db_obj, obj_in)

@router.delete("/cover_share_popup/{cover_share_popup_id}")
def delete_cover_share_popup_view(cover_share_popup_id: int, db: Session = Depends(get_db)):
    delete_cover_share_popup(db, cover_share_popup_id)
    return {"ok": True}
