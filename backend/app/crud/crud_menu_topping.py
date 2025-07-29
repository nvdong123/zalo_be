from sqlmodel import Session, select
from app.models.menu_topping import MenuTopping
from app.schemas.menu_topping import MenuToppingCreate, MenuToppingUpdate
from typing import List, Optional

def get_menu_toppings(db: Session, skip: int = 0, limit: int = 100) -> List[MenuTopping]:
    return db.exec(select(MenuTopping).offset(skip).limit(limit)).all()

def get_menu_topping(db: Session, menu_topping_id: int) -> Optional[MenuTopping]:
    return db.get(MenuTopping, menu_topping_id)

def create_menu_topping(db: Session, obj_in: MenuToppingCreate) -> MenuTopping:
    db_obj = MenuTopping(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_menu_topping(db: Session, db_obj: MenuTopping, obj_in: MenuToppingUpdate) -> MenuTopping:
    obj_data = obj_in.dict(exclude_unset=True)
    for field, value in obj_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_menu_topping(db: Session, menu_topping_id: int) -> None:
    db_obj = db.get(MenuTopping, menu_topping_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
