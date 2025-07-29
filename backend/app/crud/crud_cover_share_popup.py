from sqlmodel import Session, select
from app.models.cover_share_popup import CoverSharePopup
from app.schemas.cover_share_popup import CoverSharePopupCreate, CoverSharePopupUpdate
from typing import List, Optional

def get_cover_share_popups(db: Session, skip: int = 0, limit: int = 100) -> List[CoverSharePopup]:
    return db.exec(select(CoverSharePopup).offset(skip).limit(limit)).all()

def get_cover_share_popup(db: Session, cover_share_popup_id: int) -> Optional[CoverSharePopup]:
    return db.get(CoverSharePopup, cover_share_popup_id)

def create_cover_share_popup(db: Session, obj_in: CoverSharePopupCreate) -> CoverSharePopup:
    db_obj = CoverSharePopup(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_cover_share_popup(db: Session, db_obj: CoverSharePopup, obj_in: CoverSharePopupUpdate) -> CoverSharePopup:
    obj_data = obj_in.dict(exclude_unset=True)
    for field, value in obj_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_cover_share_popup(db: Session, cover_share_popup_id: int) -> None:
    db_obj = db.get(CoverSharePopup, cover_share_popup_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
