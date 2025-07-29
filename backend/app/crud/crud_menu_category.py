from sqlmodel import Session, select
from app.models.menu_category import MenuCategory
from app.schemas.menu_category import MenuCategoryCreate, MenuCategoryUpdate
from typing import List, Optional

def get_menu_categories(db: Session):
    return db.exec(select(MenuCategory)).all()

def create_menu_category(db: Session, obj_in: MenuCategoryCreate):
    db_obj = MenuCategory(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_menu_category(db: Session, menu_category_id: int) -> Optional[MenuCategory]:
    return db.get(MenuCategory, menu_category_id)

def update_menu_category(db: Session, db_obj: MenuCategory, obj_in: MenuCategoryUpdate) -> MenuCategory:
    obj_data = obj_in.dict(exclude_unset=True)
    for field, value in obj_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_menu_category(db: Session, menu_category_id: int) -> None:
    db_obj = db.get(MenuCategory, menu_category_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
