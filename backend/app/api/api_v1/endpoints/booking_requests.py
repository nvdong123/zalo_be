from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.crud.crud_booking_requests import booking_request
from app.schemas.booking_requests import BookingRequestCreate, BookingRequestRead, BookingRequestUpdate

router = APIRouter()

@router.get("/booking-requests", response_model=List[BookingRequestRead])
def read_booking_requests(
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all booking requests for a tenant"""
    return booking_request.get_multi(db=db, tenant_id=tenant_id, skip=skip, limit=limit)

@router.post("/booking-requests", response_model=BookingRequestRead)
def create_booking_request(
    *,
    tenant_id: int,
    obj_in: BookingRequestCreate,
    db: Session = Depends(get_db)
):
    """Create new booking request"""
    return booking_request.create(db=db, obj_in=obj_in, tenant_id=tenant_id)

@router.get("/booking-requests/{item_id}", response_model=BookingRequestRead)
def read_booking_request(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db)
):
    """Get booking request by ID"""
    obj = booking_request.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="BookingRequest not found")
    return obj

@router.put("/booking-requests/{item_id}", response_model=BookingRequestRead)
def update_booking_request(
    *,
    item_id: int,
    tenant_id: int,
    obj_in: BookingRequestUpdate,
    db: Session = Depends(get_db)
):
    """Update booking request"""
    obj = booking_request.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="BookingRequest not found")
    return booking_request.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/booking-requests/{item_id}")
def delete_booking_request(
    *,
    item_id: int,
    tenant_id: int,
    deleted_by: str = None,
    db: Session = Depends(get_db)
):
    """Delete booking request"""
    obj = booking_request.remove(db=db, id=item_id, tenant_id=tenant_id, deleted_by=deleted_by)
    if not obj:
        raise HTTPException(status_code=404, detail="BookingRequest not found")
    return {"message": "BookingRequest deleted successfully"}