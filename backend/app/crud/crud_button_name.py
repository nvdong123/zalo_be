from sqlmodel import Session, select
from app.models.button_name import ButtonName
from typing import List, Optional

def get_button_names(db: Session) -> List[ButtonName]:
    return db.exec(select(ButtonName)).all()

def get_button_name(db: Session, button_name_id: int) -> Optional[ButtonName]:
    return db.get(ButtonName, button_name_id)

def create_button_name(db: Session, button_name: ButtonName) -> ButtonName:
    db.add(button_name)
    db.commit()
    db.refresh(button_name)
    return button_name

def update_button_name(db: Session, button_name_id: int, updates: dict) -> Optional[ButtonName]:
    db_obj = db.get(ButtonName, button_name_id)
    if not db_obj:
        return None
    for key, value in updates.items():
        setattr(db_obj, key, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_button_name(db: Session, button_name_id: int) -> bool:
    db_obj = db.get(ButtonName, button_name_id)
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True
