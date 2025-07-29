from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.menu_topping import MenuTopping, MenuToppingCreate, MenuToppingUpdate
from app.crud.crud_menu_topping import (
    get_menu_toppings,
    get_menu_topping,
    create_menu_topping,
    update_menu_topping,
    delete_menu_topping,
)
from app.db.session import get_db

router = APIRouter()

@router.get("/menu_topping/", response_model=List[MenuTopping])
def read_menu_toppings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_menu_toppings(db, skip=skip, limit=limit)

@router.get("/menu_topping/{menu_topping_id}", response_model=MenuTopping)
def read_menu_topping(menu_topping_id: int, db: Session = Depends(get_db)):
    db_obj = get_menu_topping(db, menu_topping_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="MenuTopping not found")
    return db_obj

@router.post("/menu_topping/", response_model=MenuTopping)
def create_menu_topping_view(obj_in: MenuToppingCreate, db: Session = Depends(get_db)):
    return create_menu_topping(db, obj_in)

@router.put("/menu_topping/{menu_topping_id}", response_model=MenuTopping)
def update_menu_topping_view(menu_topping_id: int, obj_in: MenuToppingUpdate, db: Session = Depends(get_db)):
    db_obj = get_menu_topping(db, menu_topping_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="MenuTopping not found")
    return update_menu_topping(db, db_obj, obj_in)

@router.delete("/menu_topping/{menu_topping_id}")
def delete_menu_topping_view(menu_topping_id: int, db: Session = Depends(get_db)):
    delete_menu_topping(db, menu_topping_id)
    return {"ok": True}
