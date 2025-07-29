from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.order_item_topping import OrderItemTopping, OrderItemToppingCreate, OrderItemToppingUpdate
from app.crud.crud_order_item_topping import (
    get_order_item_toppings,
    get_order_item_topping,
    create_order_item_topping,
    update_order_item_topping,
    delete_order_item_topping,
)
from app.db.session import get_db

router = APIRouter()

@router.get("/order_item_topping/", response_model=List[OrderItemTopping])
def read_order_item_toppings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_order_item_toppings(db, skip=skip, limit=limit)

@router.get("/order_item_topping/{order_item_topping_id}", response_model=OrderItemTopping)
def read_order_item_topping(order_item_topping_id: int, db: Session = Depends(get_db)):
    db_obj = get_order_item_topping(db, order_item_topping_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="OrderItemTopping not found")
    return db_obj

@router.post("/order_item_topping/", response_model=OrderItemTopping)
def create_order_item_topping_view(obj_in: OrderItemToppingCreate, db: Session = Depends(get_db)):
    return create_order_item_topping(db, obj_in)

@router.put("/order_item_topping/{order_item_topping_id}", response_model=OrderItemTopping)
def update_order_item_topping_view(order_item_topping_id: int, obj_in: OrderItemToppingUpdate, db: Session = Depends(get_db)):
    db_obj = get_order_item_topping(db, order_item_topping_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="OrderItemTopping not found")
    return update_order_item_topping(db, db_obj, obj_in)

@router.delete("/order_item_topping/{order_item_topping_id}")
def delete_order_item_topping_view(order_item_topping_id: int, db: Session = Depends(get_db)):
    delete_order_item_topping(db, order_item_topping_id)
    return {"ok": True}
