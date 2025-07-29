from sqlmodel import Session, select
from app.models.orders import Orders
from app.schemas.orders import OrdersCreate, OrdersUpdate
from typing import List, Optional

def get_orders(db: Session, skip: int = 0, limit: int = 100) -> List[Orders]:
    return db.exec(select(Orders).offset(skip).limit(limit)).all()

def get_order(db: Session, orders_id: int) -> Optional[Orders]:
    return db.get(Orders, orders_id)

def create_order(db: Session, obj_in: OrdersCreate) -> Orders:
    db_obj = Orders(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_order(db: Session, db_obj: Orders, obj_in: OrdersUpdate) -> Orders:
    obj_data = obj_in.dict(exclude_unset=True)
    for field, value in obj_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_order(db: Session, orders_id: int) -> None:
    db_obj = db.get(Orders, orders_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
