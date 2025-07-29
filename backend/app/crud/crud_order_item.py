from sqlmodel import Session, select
from app.models.order_item import OrderItem
from app.schemas.order_item import OrderItemCreate, OrderItemUpdate
from typing import List, Optional

def get_order_items(db: Session, skip: int = 0, limit: int = 100) -> List[OrderItem]:
    return db.exec(select(OrderItem).offset(skip).limit(limit)).all()

def get_order_item(db: Session, order_item_id: int) -> Optional[OrderItem]:
    return db.get(OrderItem, order_item_id)

def create_order_item(db: Session, obj_in: OrderItemCreate) -> OrderItem:
    db_obj = OrderItem(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_order_item(db: Session, db_obj: OrderItem, obj_in: OrderItemUpdate) -> OrderItem:
    obj_data = obj_in.dict(exclude_unset=True)
    for field, value in obj_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_order_item(db: Session, order_item_id: int) -> None:
    db_obj = db.get(OrderItem, order_item_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
