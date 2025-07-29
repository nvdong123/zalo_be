from sqlmodel import Session, select
from app.models.menu_product import MenuProduct
from app.schemas.menu_product import MenuProductCreate, MenuProductUpdate
from typing import List, Optional

def get_menu_products(db: Session, skip: int = 0, limit: int = 100) -> List[MenuProduct]:
    return db.exec(select(MenuProduct).offset(skip).limit(limit)).all()

def get_menu_product(db: Session, menu_product_id: int) -> Optional[MenuProduct]:
    return db.get(MenuProduct, menu_product_id)

def create_menu_product(db: Session, obj_in: MenuProductCreate) -> MenuProduct:
    db_obj = MenuProduct(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_menu_product(db: Session, db_obj: MenuProduct, obj_in: MenuProductUpdate) -> MenuProduct:
    obj_data = obj_in.dict(exclude_unset=True)
    for field, value in obj_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_menu_product(db: Session, menu_product_id: int) -> None:
    db_obj = db.get(MenuProduct, menu_product_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
