from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.order_item import OrderItem, OrderItemCreate, OrderItemUpdate
from app.crud.crud_order_item import (
    get_order_items,
    get_order_item,
    create_order_item,
    update_order_item,
    delete_order_item,
)
from app.db.session import get_db

router = APIRouter()

@router.get("/order_item/", response_model=List[OrderItem])
def read_order_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_order_items(db, skip=skip, limit=limit)

@router.get("/order_item/{order_item_id}", response_model=OrderItem)
def read_order_item(order_item_id: int, db: Session = Depends(get_db)):
    db_obj = get_order_item(db, order_item_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="OrderItem not found")
    return db_obj

@router.post("/order_item/", response_model=OrderItem)
def create_order_item_view(obj_in: OrderItemCreate, db: Session = Depends(get_db)):
    return create_order_item(db, obj_in)

@router.put("/order_item/{order_item_id}", response_model=OrderItem)
def update_order_item_view(order_item_id: int, obj_in: OrderItemUpdate, db: Session = Depends(get_db)):
    db_obj = get_order_item(db, order_item_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="OrderItem not found")
    return update_order_item(db, db_obj, obj_in)

@router.delete("/order_item/{order_item_id}")
def delete_order_item_view(order_item_id: int, db: Session = Depends(get_db)):
    delete_order_item(db, order_item_id)
    return {"ok": True}
