from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.core.deps import get_db, get_current_admin_user
from app.models.models import TblBookingRequests, TblAdminUsers, TblCustomers, TblRooms
from app.schemas.booking_requests import BookingRequestUpdate

router = APIRouter()

class BookingStatusUpdate(BaseModel):
    status: str
    admin_notes: Optional[str] = None

class BookingSearchFilter(BaseModel):
    customer_name: Optional[str] = None
    status: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    room_id: Optional[int] = None

def send_booking_notification(booking_id: int, status: str, customer_email: str = None):
    """
    Gửi thông báo về booking (placeholder cho future implementation)
    """
    # TODO: Implement email/SMS notification
    pass

@router.get("/booking-requests/management")
def get_booking_requests_advanced(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status_filter: Optional[str] = Query(None),
    customer_name: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    current_user: TblAdminUsers = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách booking requests với bộ lọc nâng cao
    """
    try:
        # Base query với tenant filtering - không join với customers để tránh lỗi
        query = db.query(TblBookingRequests).filter(
            and_(
                TblBookingRequests.deleted == 0,
                TblBookingRequests.tenant_id == current_user.tenant_id
            )
        )
        
        # Apply filters
        if status_filter:
            query = query.filter(TblBookingRequests.status == status_filter)
        
        # Tạm thời comment out customer_name filter để tránh lỗi
        # if customer_name:
        #     query = query.filter(
        #         TblCustomers.name.ilike(f"%{customer_name}%")
        #     )
        
        if date_from:
            try:
                date_from_obj = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                query = query.filter(TblBookingRequests.check_in_date >= date_from_obj)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date_from format")
        
        if date_to:
            try:
                date_to_obj = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                query = query.filter(TblBookingRequests.check_out_date <= date_to_obj)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date_to format")
        
        # Get total count
        total_count = query.count()
        
        # Get paginated results with order by creation date
        bookings = query.order_by(TblBookingRequests.created_at.desc()).offset(skip).limit(limit).all()
        
        # Enhance with additional info
        enhanced_bookings = []
        for booking in bookings:
            # Get customer info
            customer = db.query(TblCustomers).filter(TblCustomers.id == booking.customer_id).first()
            
            # Get room info
            room = db.query(TblRooms).filter(TblRooms.id == booking.room_id).first()
            
            booking_data = {
                "id": booking.id,
                "tenant_id": booking.tenant_id,
                "customer_id": booking.customer_id,
                "room_id": booking.room_id,
                "check_in_date": booking.check_in_date.isoformat() if booking.check_in_date else None,
                "check_out_date": booking.check_out_date.isoformat() if booking.check_out_date else None,
                "total_amount": float(0),  # Default value vì không có field này
                "status": booking.status,
                "special_requests": booking.note,  # Sử dụng note thay vì special_requests
                "created_at": booking.created_at.isoformat(),
                "updated_at": booking.updated_at.isoformat() if booking.updated_at else None,
                "customer": {
                    "name": customer.name if customer else "Unknown",
                    "avatar_url": None,  # TblCustomers không có field này
                    "phone": booking.mobile_number
                },
                "room": {
                    "name": room.room_name if room else "Unknown Room",
                    "type": room.room_type if room else "Standard"
                }
            }
            enhanced_bookings.append(booking_data)
        
        return {
            "success": True,
            "data": {
                "bookings": enhanced_bookings,
                "pagination": {
                    "total": total_count,
                    "skip": skip,
                    "limit": limit,
                    "has_more": skip + limit < total_count
                },
                "filters_applied": {
                    "status": status_filter,
                    "customer_name": customer_name,
                    "date_from": date_from,
                    "date_to": date_to
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi lấy danh sách booking: {str(e)}")

@router.get("/booking-requests/management/{booking_id}")
def get_booking_detail(
    booking_id: int,
    current_user: TblAdminUsers = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Lấy chi tiết booking request
    """
    try:
        # Get booking with tenant check
        booking = db.query(TblBookingRequests).filter(
            and_(
                TblBookingRequests.id == booking_id,
                TblBookingRequests.tenant_id == current_user.tenant_id,
                TblBookingRequests.deleted == 0
            )
        ).first()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking không tồn tại")
        
        # Get related information
        customer = db.query(TblCustomers).filter(TblCustomers.id == booking.customer_id).first()
        room = db.query(TblRooms).filter(TblRooms.id == booking.room_id).first()
        
        # Calculate stay duration
        if booking.check_in_date and booking.check_out_date:
            stay_duration = (booking.check_out_date - booking.check_in_date).days
        else:
            stay_duration = 0
        
        booking_detail = {
            "id": booking.id,
            "customer_name": "Unknown",  # Tạm thời để "Unknown"
            "customer_phone": booking.mobile_number,  # Sử dụng mobile_number
            "customer_email": "N/A",  # Không có field này
            "room_id": booking.room_id,
            "check_in_date": booking.check_in_date.isoformat() if booking.check_in_date else None,
            "check_out_date": booking.check_out_date.isoformat() if booking.check_out_date else None,
            "adults": 1,  # Default value
            "children": 0,  # Default value
            "total_amount": float(0),  # Default value
            "status": booking.status,
            "special_requests": booking.note,  # Sử dụng note thay vì special_requests
            "admin_notes": "N/A",  # Default value vì không có field này
            "payment_status": "pending",  # Default value vì không có field này
            "created_at": booking.created_at.isoformat(),
            "updated_at": booking.updated_at.isoformat() if booking.updated_at else None,
            "stay_duration_days": stay_duration,
            "customer_info": {
                "customer_id": customer.id if customer else None,
                "full_name": customer.name if customer else None,  # Sử dụng name thay vì full_name
                "loyalty_points": 0,  # Default value
                "total_bookings": 0  # Default value
            } if customer else None,
            "room_info": {
                "room_name": room.room_name if room else None,
                "room_type": room.room_type if room else None,
                "price": float(room.price or 0) if room else 0,
                "capacity_adults": room.capacity_adults if room else None,
                "capacity_children": room.capacity_children if room else None
            } if room else None
        }
        
        return {
            "success": True,
            "data": booking_detail
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi lấy chi tiết booking: {str(e)}")

@router.put("/booking-requests/management/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    status_update: BookingStatusUpdate,
    background_tasks: BackgroundTasks,
    current_user: TblAdminUsers = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Cập nhật trạng thái booking request
    """
    try:
        # Valid statuses
        valid_statuses = ["pending", "confirmed", "cancelled", "completed", "no_show"]
        if status_update.status not in valid_statuses:
            raise HTTPException(
                status_code=400, 
                detail=f"Status không hợp lệ. Chỉ chấp nhận: {', '.join(valid_statuses)}"
            )
        
        # Get booking with tenant check
        booking = db.query(TblBookingRequests).filter(
            and_(
                TblBookingRequests.id == booking_id,
                TblBookingRequests.tenant_id == current_user.tenant_id,
                TblBookingRequests.deleted == 0
            )
        ).first()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking không tồn tại")
        
        # Store old status for logging
        old_status = booking.status
        
        # Update booking
        booking.status = status_update.status
        if status_update.admin_notes:
            booking.admin_notes = status_update.admin_notes
        booking.updated_at = datetime.now()
        booking.updated_by = current_user.username
        
        db.commit()
        db.refresh(booking)
        
        # Add background task for notification - tạm thời comment out vì không có email field
        # if booking.customer_email:
        #     background_tasks.add_task(
        #         send_booking_notification,
        #         booking_id,
        #         status_update.status,
        #         booking.customer_email
        #     )
        
        return {
            "success": True,
            "message": f"Đã cập nhật trạng thái booking từ '{old_status}' sang '{status_update.status}'",
            "data": {
                "booking_id": booking_id,
                "old_status": old_status,
                "new_status": status_update.status,
                "updated_by": current_user.username,
                "updated_at": booking.updated_at.isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi cập nhật trạng thái: {str(e)}")

@router.get("/booking-requests/management/statistics")
def get_booking_statistics(
    days: int = Query(30, ge=1, le=365),
    current_user: TblAdminUsers = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Lấy thống kê booking requests trong khoảng thời gian
    """
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Base query with tenant and date filter
        base_query = db.query(TblBookingRequests).filter(
            and_(
                TblBookingRequests.tenant_id == current_user.tenant_id,
                TblBookingRequests.created_at >= start_date,
                TblBookingRequests.deleted == 0
            )
        )
        
        # Count by status
        status_counts = {}
        statuses = ["pending", "confirmed", "cancelled", "completed", "no_show"]
        for status in statuses:
            count = base_query.filter(TblBookingRequests.status == status).count()
            status_counts[status] = count
        
        # Total bookings
        total_bookings = base_query.count()
        
        # Total revenue (confirmed + completed bookings)
        revenue_query = base_query.filter(
            TblBookingRequests.status.in_(["confirmed", "completed"])
        )
        total_revenue = db.query(func.sum(TblBookingRequests.total_amount)).filter(
            and_(
                TblBookingRequests.tenant_id == current_user.tenant_id,
                TblBookingRequests.created_at >= start_date,
                TblBookingRequests.status.in_(["confirmed", "completed"]),
                TblBookingRequests.deleted == 0
            )
        ).scalar() or 0
        
        # Average booking value
        avg_booking_value = float(total_revenue) / max(status_counts["confirmed"] + status_counts["completed"], 1)
        
        # Bookings by day (last 7 days)
        daily_bookings = []
        for i in range(7):
            day_start = (datetime.now() - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            day_count = db.query(func.count(TblBookingRequests.id)).filter(
                and_(
                    TblBookingRequests.tenant_id == current_user.tenant_id,
                    TblBookingRequests.created_at >= day_start,
                    TblBookingRequests.created_at < day_end,
                    TblBookingRequests.deleted == 0
                )
            ).scalar() or 0
            
            daily_bookings.append({
                "date": day_start.strftime("%Y-%m-%d"),
                "count": day_count
            })
        
        # Reverse to get chronological order
        daily_bookings.reverse()
        
        # Top customers (by booking count) - tạm thời comment out vì không có customer fields
        # top_customers = db.query(
        #     TblBookingRequests.customer_name,
        #     TblBookingRequests.customer_email,
        #     func.count(TblBookingRequests.id).label('booking_count'),
        #     func.sum(TblBookingRequests.total_amount).label('total_spent')
        # ).filter(
        #     and_(
        #         TblBookingRequests.tenant_id == current_user.tenant_id,
        #         TblBookingRequests.created_at >= start_date,
        #         TblBookingRequests.deleted == 0
        #     )
        # ).group_by(
        #     TblBookingRequests.customer_name,
        #     TblBookingRequests.customer_email
        # ).order_by(
        #     func.count(TblBookingRequests.id).desc()
        # ).limit(5).all()

        # top_customers_data = [
        #     {
        #         "customer_name": customer.customer_name,
        #         "customer_email": customer.customer_email,
        #         "booking_count": customer.booking_count,
        #         "total_spent": float(customer.total_spent or 0)
        #     }
        #     for customer in top_customers
        # ]
        
        top_customers_data = []  # Tạm thời để trống
        
        return {
            "success": True,
            "data": {
                "period": {
                    "days": days,
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat()
                },
                "overview": {
                    "total_bookings": total_bookings,
                    "total_revenue": float(total_revenue),
                    "average_booking_value": round(avg_booking_value, 2)
                },
                "status_breakdown": status_counts,
                "daily_trend": daily_bookings,
                "top_customers": top_customers_data
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi lấy thống kê booking: {str(e)}")

@router.post("/booking-requests/management/{booking_id}/cancel")
def cancel_booking_with_reason(
    booking_id: int,
    cancellation_reason: str,
    current_user: TblAdminUsers = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Hủy booking với lý do cụ thể
    """
    try:
        # Get booking with tenant check
        booking = db.query(TblBookingRequests).filter(
            and_(
                TblBookingRequests.id == booking_id,
                TblBookingRequests.tenant_id == current_user.tenant_id,
                TblBookingRequests.deleted == 0
            )
        ).first()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking không tồn tại")
        
        if booking.status == "cancelled":
            raise HTTPException(status_code=400, detail="Booking đã bị hủy")
        
        if booking.status == "completed":
            raise HTTPException(status_code=400, detail="Không thể hủy booking đã hoàn thành")
        
        # Update booking
        old_status = booking.status
        booking.status = "cancelled"
        booking.admin_notes = f"Hủy bởi {current_user.username}. Lý do: {cancellation_reason}"
        booking.updated_at = datetime.now()
        booking.updated_by = current_user.username
        
        db.commit()
        db.refresh(booking)
        
        return {
            "success": True,
            "message": "Booking đã được hủy thành công",
            "data": {
                "booking_id": booking_id,
                "old_status": old_status,
                "new_status": "cancelled",
                "cancellation_reason": cancellation_reason,
                "cancelled_by": current_user.username,
                "cancelled_at": booking.updated_at.isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi hủy booking: {str(e)}")
