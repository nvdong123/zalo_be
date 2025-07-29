from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, Optional
from app.models.merchant import Merchant
from app.models.room import Room
from app.models.service import Service
from app.models.orders import Orders
from app.models.user import User
from app.db.session import get_db

router = APIRouter()

@router.get("/dashboard/admin/stats")
def get_admin_dashboard_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Lấy thống kê tổng quan cho admin dashboard
    """
    try:
        # Thống kê merchants
        total_merchants = db.query(func.count(Merchant.id)).scalar() or 0
        active_merchants = db.query(func.count(Merchant.id)).filter(
            Merchant.status == 'ACTIVE'
        ).scalar() or 0
        
        # Thống kê rooms
        total_rooms = db.query(func.count(Room.id)).scalar() or 0
        available_rooms = db.query(func.count(Room.id)).filter(
            Room.status == 'AVAILABLE'
        ).scalar() or 0
        
        # Thống kê services
        total_services = db.query(func.count(Service.id)).scalar() or 0
        active_services = db.query(func.count(Service.id)).filter(
            Service.status == 'ACTIVE'
        ).scalar() or 0
        
        # Thống kê users
        total_users = db.query(func.count(User.id)).scalar() or 0
        
        # Thống kê orders (nếu có)
        total_orders = db.query(func.count(Orders.id)).scalar() or 0
        
        return {
            "success": True,
            "data": {
                "merchants": {
                    "total": total_merchants,
                    "active": active_merchants,
                    "inactive": total_merchants - active_merchants
                },
                "rooms": {
                    "total": total_rooms,
                    "available": available_rooms,
                    "occupied": total_rooms - available_rooms
                },
                "services": {
                    "total": total_services,
                    "active": active_services,
                    "inactive": total_services - active_services
                },
                "users": {
                    "total": total_users
                },
                "orders": {
                    "total": total_orders
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi server: {str(e)}")

@router.get("/dashboard/merchant/{merchant_id}/stats")
def get_merchant_dashboard_stats(
    merchant_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Lấy thống kê cho merchant dashboard
    """
    try:
        # Kiểm tra merchant tồn tại
        merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
        if not merchant:
            raise HTTPException(status_code=404, detail="Merchant không tồn tại")
        
        # Thống kê rooms của merchant
        total_rooms = db.query(func.count(Room.id)).filter(
            Room.merchant_id == merchant_id
        ).scalar() or 0
        
        available_rooms = db.query(func.count(Room.id)).filter(
            Room.merchant_id == merchant_id,
            Room.status == 'AVAILABLE'
        ).scalar() or 0
        
        # Thống kê services của merchant
        total_services = db.query(func.count(Service.id)).filter(
            Service.merchant_id == merchant_id
        ).scalar() or 0
        
        active_services = db.query(func.count(Service.id)).filter(
            Service.merchant_id == merchant_id,
            Service.status == 'ACTIVE'
        ).scalar() or 0
        
        # Thống kê orders của merchant
        total_orders = db.query(func.count(Orders.id)).filter(
            Orders.merchant_id == merchant_id
        ).scalar() or 0
        
        return {
            "success": True,
            "data": {
                "merchant": {
                    "id": merchant.id,
                    "name": merchant.name,
                    "status": merchant.status
                },
                "rooms": {
                    "total": total_rooms,
                    "available": available_rooms,
                    "occupied": total_rooms - available_rooms
                },
                "services": {
                    "total": total_services,
                    "active": active_services,
                    "inactive": total_services - active_services
                },
                "orders": {
                    "total": total_orders
                }
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi server: {str(e)}")

@router.get("/dashboard/recent-activities")
def get_recent_activities(
    limit: int = Query(10, le=50),
    merchant_id: Optional[int] = None,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Lấy hoạt động gần đây
    """
    try:
        activities = []
        
        # Lấy merchants mới nhất
        query = db.query(Merchant).order_by(Merchant.created_at.desc())
        if merchant_id:
            query = query.filter(Merchant.id == merchant_id)
        
        recent_merchants = query.limit(limit // 3).all()
        for merchant in recent_merchants:
            activities.append({
                "type": "merchant",
                "action": "created",
                "title": f"Merchant mới: {merchant.name}",
                "description": f"Địa chỉ: {merchant.address or 'Chưa có'}",
                "timestamp": merchant.created_at,
                "status": merchant.status
            })
        
        # Lấy rooms mới nhất
        room_query = db.query(Room).order_by(Room.created_at.desc())
        if merchant_id:
            room_query = room_query.filter(Room.merchant_id == merchant_id)
            
        recent_rooms = room_query.limit(limit // 3).all()
        for room in recent_rooms:
            activities.append({
                "type": "room",
                "action": "created", 
                "title": f"Phòng mới: {room.name}",
                "description": f"Giá: {room.price:,} VND/đêm",
                "timestamp": room.created_at,
                "status": room.status
            })
        
        # Lấy services mới nhất
        service_query = db.query(Service).order_by(Service.created_at.desc())
        if merchant_id:
            service_query = service_query.filter(Service.merchant_id == merchant_id)
            
        recent_services = service_query.limit(limit // 3).all()
        for service in recent_services:
            activities.append({
                "type": "service",
                "action": "created",
                "title": f"Dịch vụ mới: {service.name}",
                "description": f"Giá: {service.price:,} VND",
                "timestamp": service.created_at,
                "status": service.status
            })
        
        # Sắp xếp theo thời gian
        activities.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return {
            "success": True,
            "data": activities[:limit]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi server: {str(e)}")
