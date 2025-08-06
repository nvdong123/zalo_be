from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.crud.crud_service_bookings import service_booking
from app.schemas.service_bookings import ServiceBookingCreate, ServiceBookingRead, ServiceBookingUpdate

router = APIRouter()

@router.get("/service-bookings", response_model=List[ServiceBookingRead])
def read_service_bookings(
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all service bookings for a tenant"""
    return service_booking.get_multi(db=db, tenant_id=tenant_id, skip=skip, limit=limit)

@router.post("/service-bookings", response_model=ServiceBookingRead)
def create_servicebooking(
    *,
    tenant_id: int,
    obj_in: ServiceBookingCreate,
    db: Session = Depends(get_db)
):
    """Create new service bookings"""
    return service_booking.create(db=db, obj_in=obj_in, tenant_id=tenant_id)

@router.get("/service-bookings/{item_id}", response_model=ServiceBookingRead)
def read_servicebooking(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db)
):
    """Get service bookings by ID"""
    obj = service_booking.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="ServiceBooking not found")
    return obj

@router.put("/service-bookings/{item_id}", response_model=ServiceBookingRead)
def update_servicebooking(
    *,
    item_id: int,
    tenant_id: int,
    obj_in: ServiceBookingUpdate,
    db: Session = Depends(get_db)
):
    """Update service bookings"""
    obj = service_booking.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="ServiceBooking not found")
    return service_booking.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/service-bookings/{item_id}")
def delete_servicebooking(
    *,
    item_id: int,
    tenant_id: int,
    deleted_by: str = None,
    db: Session = Depends(get_db)
):
    """Delete service bookings"""
    obj = service_booking.remove(db=db, id=item_id, tenant_id=tenant_id, deleted_by=deleted_by)
    if not obj:
        raise HTTPException(status_code=404, detail="ServiceBooking not found")
    return {"message": "ServiceBooking deleted successfully"}
