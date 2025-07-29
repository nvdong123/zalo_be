from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List
from app.db.session import get_db
from app.models.button_name import ButtonName
from app.schemas.button_name import ButtonNameCreate, ButtonNameRead, ButtonNameUpdate
from app.crud.crud_button_name import (
    get_button_names, get_button_name, create_button_name, update_button_name, delete_button_name
)

router = APIRouter()

@router.get("/button_name", response_model=List[ButtonNameRead])
def read_button_names(db: Session = Depends(get_db)):
    return get_button_names(db)

@router.get("/button_name/{button_name_id}", response_model=ButtonNameRead)
def read_button_name(button_name_id: int, db: Session = Depends(get_db)):
    db_obj = get_button_name(db, button_name_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="ButtonName not found")
    return db_obj

@router.post("/button_name", response_model=ButtonNameRead)
def create_button_name_view(button_name: ButtonNameCreate, db: Session = Depends(get_db)):
    db_obj = ButtonName.from_orm(button_name)
    return create_button_name(db, db_obj)

@router.put("/button_name/{button_name_id}", response_model=ButtonNameRead)
def update_button_name_view(button_name_id: int, button_name: ButtonNameUpdate, db: Session = Depends(get_db)):
    updates = button_name.dict(exclude_unset=True)
    db_obj = update_button_name(db, button_name_id, updates)
    if not db_obj:
        raise HTTPException(status_code=404, detail="ButtonName not found")
    return db_obj

@router.delete("/button_name/{button_name_id}")
def delete_button_name_view(button_name_id: int, db: Session = Depends(get_db)):
    success = delete_button_name(db, button_name_id)
    if not success:
        raise HTTPException(status_code=404, detail="ButtonName not found")
    return {"ok": True}
