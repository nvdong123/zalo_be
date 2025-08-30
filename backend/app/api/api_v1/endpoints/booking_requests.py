from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.deps import get_db, get_current_admin_user, verify_tenant_permission
from app.crud.crud_booking_requests import booking_request
from app.schemas.booking_requests import BookingRequestCreate, BookingRequestRead, BookingRequestUpdate, BookingRequestCreateRequest, BookingRequestUpdateRequest
from app.models.models import TblAdminUsers

router = APIRouter()

class StatusUpdate(BaseModel):
    status: str

@router.get("/booking-requests", response_model=List[BookingRequestRead])
def read_booking_requests(
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get all booking requests for a tenant"""
    verify_tenant_permission(tenant_id, current_user)
    return booking_request.get_multi(db=db, tenant_id=tenant_id, skip=skip, limit=limit)

@router.post("/booking-requests", response_model=BookingRequestRead)
def create_booking_request(
    *,
    tenant_id: int,
    obj_in: BookingRequestCreateRequest,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Create new booking request"""
    verify_tenant_permission(tenant_id, current_user)
    
    # Convert BookingRequestCreateRequest to BookingRequestCreate with tenant_id
    booking_data = obj_in.dict()
    booking_data['tenant_id'] = tenant_id
    booking_data['created_by'] = current_user.username
    booking_create = BookingRequestCreate(**booking_data)
    
    return booking_request.create(db=db, obj_in=booking_create, tenant_id=tenant_id)

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

@router.patch("/booking-requests/{item_id}/status", response_model=BookingRequestRead)
def update_booking_status(
    *,
    item_id: int,
    tenant_id: int,
    status_update: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Update booking request status only"""
    verify_tenant_permission(tenant_id, current_user)
    obj = booking_request.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="BookingRequest not found")
    
    # Create update object with just status
    update_data = BookingRequestUpdateRequest(status=status_update.status)
    return booking_request.update(db=db, db_obj=obj, obj_in=update_data)

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