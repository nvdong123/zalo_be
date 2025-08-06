from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.crud.crud_hotel_brands import hotel_brand
from app.schemas.hotel_brands import HotelBrandCreate, HotelBrandRead, HotelBrandUpdate

router = APIRouter()

@router.get("/hotel-brands", response_model=List[HotelBrandRead])
def read_hotel_brands(
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all hotel brands for a tenant"""
    return hotel_brand.get_multi(db=db, tenant_id=tenant_id, skip=skip, limit=limit)

@router.post("/hotel-brands", response_model=HotelBrandRead)
def create_hotel_brand(
    *,
    tenant_id: int,
    obj_in: HotelBrandCreate,
    db: Session = Depends(get_db)
):
    """Create new hotel brands"""
    return hotel_brand.create(db=db, obj_in=obj_in, tenant_id=tenant_id)

@router.get("/hotel-brands/{item_id}", response_model=HotelBrandRead)
def read_hotel_brand(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db)
):
    """Get hotel brands by ID"""
    obj = hotel_brand.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="hotel_brand not found")
    return obj

@router.put("/hotel-brands/{item_id}", response_model=HotelBrandRead)
def update_hotel_brand(
    *,
    item_id: int,
    tenant_id: int,
    obj_in: HotelBrandUpdate,
    db: Session = Depends(get_db)
):
    """Update hotel brands"""
    obj = hotel_brand.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="hotel_brand not found")
    return hotel_brand.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/hotel-brands/{item_id}")
def delete_hotel_brand(
    *,
    item_id: int,
    tenant_id: int,
    deleted_by: str = None,
    db: Session = Depends(get_db)
):
    """Delete hotel brands"""
    obj = hotel_brand.remove(db=db, id=item_id, tenant_id=tenant_id, deleted_by=deleted_by)
    if not obj:
        raise HTTPException(status_code=404, detail="hotel_brand not found")
    return {"message": "hotel_brand deleted successfully"}
