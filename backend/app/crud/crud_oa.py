from sqlmodel import Session, select
from app.models.oa import OA
from app.schemas.oa import OACreate, OAUpdate
from typing import List, Optional

def get_oas(db: Session, skip: int = 0, limit: int = 100) -> List[OA]:
    return db.exec(select(OA).offset(skip).limit(limit)).all()

def get_oa(db: Session, oa_id: int) -> Optional[OA]:
    return db.get(OA, oa_id)

def create_oa(db: Session, obj_in: OACreate) -> OA:
    db_obj = OA(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_oa(db: Session, db_obj: OA, obj_in: OAUpdate) -> OA:
    obj_data = obj_in.dict(exclude_unset=True)
    for field, value in obj_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_oa(db: Session, oa_id: int) -> None:
    db_obj = db.get(OA, oa_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
