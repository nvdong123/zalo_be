from sqlmodel import Session, select
from app.models.order_item_topping import OrderItemTopping
from app.schemas.order_item_topping import OrderItemToppingCreate, OrderItemToppingUpdate
from typing import List, Optional

def get_order_item_toppings(db: Session, skip: int = 0, limit: int = 100) -> List[OrderItemTopping]:
    return db.exec(select(OrderItemTopping).offset(skip).limit(limit)).all()

def get_order_item_topping(db: Session, order_item_topping_id: int) -> Optional[OrderItemTopping]:
    return db.get(OrderItemTopping, order_item_topping_id)

def create_order_item_topping(db: Session, obj_in: OrderItemToppingCreate) -> OrderItemTopping:
    db_obj = OrderItemTopping(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_order_item_topping(db: Session, db_obj: OrderItemTopping, obj_in: OrderItemToppingUpdate) -> OrderItemTopping:
    obj_data = obj_in.dict(exclude_unset=True)
    for field, value in obj_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_order_item_topping(db: Session, order_item_topping_id: int) -> None:
    db_obj = db.get(OrderItemTopping, order_item_topping_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
