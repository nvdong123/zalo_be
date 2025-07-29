from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.oa import OA, OACreate, OAUpdate
from app.crud.crud_oa import (
    get_oas,
    get_oa,
    create_oa,
    update_oa,
    delete_oa,
)
from app.db.session import get_db

router = APIRouter()

@router.get("/oa/", response_model=List[OA])
def read_oas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_oas(db, skip=skip, limit=limit)

@router.get("/oa/{oa_id}", response_model=OA)
def read_oa(oa_id: int, db: Session = Depends(get_db)):
    db_obj = get_oa(db, oa_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="OA not found")
    return db_obj

@router.post("/oa/", response_model=OA)
def create_oa_view(obj_in: OACreate, db: Session = Depends(get_db)):
    return create_oa(db, obj_in)

@router.put("/oa/{oa_id}", response_model=OA)
def update_oa_view(oa_id: int, obj_in: OAUpdate, db: Session = Depends(get_db)):
    db_obj = get_oa(db, oa_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="OA not found")
    return update_oa(db, db_obj, obj_in)

@router.delete("/oa/{oa_id}")
def delete_oa_view(oa_id: int, db: Session = Depends(get_db)):
    delete_oa(db, oa_id)
    return {"ok": True}
