from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta

from app.core.deps import get_db, get_current_admin_user
from app.crud.crud_tenants import tenant
from app.schemas.tenants import TenantCreate, TenantRead, TenantUpdate
from app.models.models import (
    TblTenants, TblAdminUsers, TblRooms, TblFacilities, 
    TblBookingRequests, TblCustomers, TblServices
)

router = APIRouter()

@router.get("/tenants/management", response_model=List[Dict[str, Any]])
def get_tenants_with_stats(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status_filter: str = Query(None, regex="^(active|inactive|all)$"),
    current_user: TblAdminUsers = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách tenants với thống kê chi tiết (chỉ dành cho super_admin)
    """
    # Kiểm tra quyền
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ super admin mới có quyền xem danh sách tenants"
        )
    
    try:
        # Base query
        query = db.query(TblTenants).filter(TblTenants.deleted == 0)
        
        # Apply status filter
        if status_filter and status_filter != "all":
            query = query.filter(TblTenants.status == status_filter)
        
        # Get tenants with pagination
        tenants = query.offset(skip).limit(limit).all()
        
        tenants_with_stats = []
        for tenant_obj in tenants:
            # Get tenant statistics
            stats = get_tenant_statistics(db, tenant_obj.id)
            
            tenant_data = {
                "id": tenant_obj.id,
                "name": tenant_obj.name,
                "domain": tenant_obj.domain,
                "status": tenant_obj.status,
                "subscription_plan_id": tenant_obj.subscription_plan_id,
                "created_at": tenant_obj.created_at,
                "updated_at": tenant_obj.updated_at,
                "created_by": tenant_obj.created_by,
                "updated_by": tenant_obj.updated_by,
                "statistics": stats
            }
            tenants_with_stats.append(tenant_data)
        
        return tenants_with_stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi server: {str(e)}")

def get_tenant_statistics(db: Session, tenant_id: int) -> Dict[str, Any]:
    """
    Lấy thống kê chi tiết cho một tenant
    """
    try:
        # Count admin users
        admin_users_count = db.query(func.count(TblAdminUsers.id)).filter(
            TblAdminUsers.tenant_id == tenant_id
        ).scalar() or 0
        
        # Count rooms
        rooms_count = db.query(func.count(TblRooms.id)).filter(
            and_(TblRooms.tenant_id == tenant_id, TblRooms.deleted == 0)
        ).scalar() or 0
        
        # Count facilities
        facilities_count = db.query(func.count(TblFacilities.id)).filter(
            and_(TblFacilities.tenant_id == tenant_id, TblFacilities.deleted == 0)
        ).scalar() or 0
        
        # Count services
        services_count = db.query(func.count(TblServices.id)).filter(
            and_(TblServices.tenant_id == tenant_id, TblServices.deleted == 0)
        ).scalar() or 0
        
        # Count customers
        customers_count = db.query(func.count(TblCustomers.id)).filter(
            and_(TblCustomers.tenant_id == tenant_id, TblCustomers.deleted == 0)
        ).scalar() or 0
        
        # Count bookings
        total_bookings = db.query(func.count(TblBookingRequests.id)).filter(
            and_(TblBookingRequests.tenant_id == tenant_id, TblBookingRequests.deleted == 0)
        ).scalar() or 0
        
        # Count recent bookings (last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_bookings = db.query(func.count(TblBookingRequests.id)).filter(
            and_(
                TblBookingRequests.tenant_id == tenant_id,
                TblBookingRequests.created_at >= thirty_days_ago,
                TblBookingRequests.deleted == 0
            )
        ).scalar() or 0
        
        return {
            "admin_users": admin_users_count,
            "rooms": rooms_count,
            "facilities": facilities_count,
            "services": services_count,
            "customers": customers_count,
            "total_bookings": total_bookings,
            "recent_bookings_30d": recent_bookings
        }
        
    except Exception:
        return {
            "admin_users": 0,
            "rooms": 0,
            "facilities": 0,
            "services": 0,
            "customers": 0,
            "total_bookings": 0,
            "recent_bookings_30d": 0
        }

@router.post("/tenants/management", response_model=TenantRead)
def create_tenant_advanced(
    tenant_data: TenantCreate,
    current_user: TblAdminUsers = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Tạo tenant mới với validation nâng cao (chỉ super_admin)
    """
    # Kiểm tra quyền
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ super admin mới có quyền tạo tenant mới"
        )
    
    try:
        # Kiểm tra domain đã tồn tại
        existing_tenant = tenant.get_by_domain(db=db, domain=tenant_data.domain)
        if existing_tenant:
            raise HTTPException(
                status_code=400, 
                detail=f"Domain '{tenant_data.domain}' đã được sử dụng"
            )
        
        # Thêm thông tin người tạo
        tenant_data_dict = tenant_data.dict()
        tenant_data_dict["created_by"] = current_user.username
        tenant_data_dict["updated_by"] = current_user.username
        
        # Tạo tenant mới
        new_tenant = tenant.create(db=db, obj_in=tenant_data_dict)
        
        return new_tenant
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tạo tenant: {str(e)}")

@router.put("/tenants/management/{tenant_id}", response_model=TenantRead)
def update_tenant_advanced(
    tenant_id: int,
    tenant_data: TenantUpdate,
    current_user: TblAdminUsers = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Cập nhật tenant (super_admin hoặc admin của tenant đó)
    """
    try:
        # Lấy tenant hiện tại
        existing_tenant = tenant.get(db=db, id=tenant_id)
        if not existing_tenant:
            raise HTTPException(status_code=404, detail="Tenant không tồn tại")
        
        # Kiểm tra quyền
        if current_user.role == "super_admin":
            # Super admin có thể sửa tất cả tenant
            pass
        elif current_user.role == "admin" and current_user.tenant_id == tenant_id:
            # Admin chỉ có thể sửa tenant của mình (trừ một số field)
            restricted_fields = {"status", "subscription_plan_id"}
            update_fields = set(tenant_data.dict(exclude_unset=True).keys())
            if restricted_fields.intersection(update_fields):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Admin tenant không được sửa status và subscription_plan_id"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không đủ quyền sửa tenant này"
            )
        
        # Kiểm tra domain trùng (nếu có thay đổi domain)
        if tenant_data.domain and tenant_data.domain != existing_tenant.domain:
            domain_exists = tenant.get_by_domain(db=db, domain=tenant_data.domain)
            if domain_exists:
                raise HTTPException(
                    status_code=400,
                    detail=f"Domain '{tenant_data.domain}' đã được sử dụng"
                )
        
        # Thêm thông tin người cập nhật
        tenant_data_dict = tenant_data.dict(exclude_unset=True)
        tenant_data_dict["updated_by"] = current_user.username
        
        # Cập nhật tenant
        updated_tenant = tenant.update(db=db, db_obj=existing_tenant, obj_in=tenant_data_dict)
        
        return updated_tenant
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi cập nhật tenant: {str(e)}")

@router.delete("/tenants/management/{tenant_id}")
def delete_tenant_advanced(
    tenant_id: int,
    current_user: TblAdminUsers = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Xóa tenant (soft delete) - chỉ super_admin
    """
    # Kiểm tra quyền
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ super admin mới có quyền xóa tenant"
        )
    
    try:
        # Kiểm tra tenant tồn tại
        existing_tenant = tenant.get(db=db, id=tenant_id)
        if not existing_tenant:
            raise HTTPException(status_code=404, detail="Tenant không tồn tại")
        
        # Kiểm tra xem tenant có dữ liệu không
        has_data = check_tenant_has_data(db, tenant_id)
        if has_data["has_data"]:
            raise HTTPException(
                status_code=400,
                detail=f"Không thể xóa tenant vì còn dữ liệu: {', '.join(has_data['data_types'])}"
            )
        
        # Soft delete tenant
        result = tenant.remove(db=db, id=tenant_id, deleted_by=current_user.username)
        if not result:
            raise HTTPException(status_code=500, detail="Lỗi khi xóa tenant")
        
        # Deactivate all admin users of this tenant
        db.query(TblAdminUsers).filter(TblAdminUsers.tenant_id == tenant_id).update({
            "status": "inactive"
        })
        db.commit()
        
        return {
            "success": True,
            "message": "Tenant đã được xóa thành công",
            "deleted_by": current_user.username,
            "deleted_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xóa tenant: {str(e)}")

def check_tenant_has_data(db: Session, tenant_id: int) -> Dict[str, Any]:
    """
    Kiểm tra xem tenant có dữ liệu không trước khi xóa
    """
    data_types = []
    
    # Check rooms
    if db.query(func.count(TblRooms.id)).filter(
        and_(TblRooms.tenant_id == tenant_id, TblRooms.deleted == 0)
    ).scalar() > 0:
        data_types.append("rooms")
    
    # Check facilities
    if db.query(func.count(TblFacilities.id)).filter(
        and_(TblFacilities.tenant_id == tenant_id, TblFacilities.deleted == 0)
    ).scalar() > 0:
        data_types.append("facilities")
    
    # Check services
    if db.query(func.count(TblServices.id)).filter(
        and_(TblServices.tenant_id == tenant_id, TblServices.deleted == 0)
    ).scalar() > 0:
        data_types.append("services")
    
    # Check customers
    if db.query(func.count(TblCustomers.id)).filter(
        and_(TblCustomers.tenant_id == tenant_id, TblCustomers.deleted == 0)
    ).scalar() > 0:
        data_types.append("customers")
    
    # Check bookings
    if db.query(func.count(TblBookingRequests.id)).filter(
        and_(TblBookingRequests.tenant_id == tenant_id, TblBookingRequests.deleted == 0)
    ).scalar() > 0:
        data_types.append("bookings")
    
    return {
        "has_data": len(data_types) > 0,
        "data_types": data_types
    }

@router.get("/tenants/management/{tenant_id}/detailed-stats")
def get_tenant_detailed_stats(
    tenant_id: int,
    current_user: TblAdminUsers = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Lấy thống kê chi tiết của một tenant
    """
    # Kiểm tra quyền
    if current_user.role not in ["super_admin"] and current_user.tenant_id != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền xem thống kê tenant này"
        )
    
    try:
        # Kiểm tra tenant tồn tại
        tenant_obj = tenant.get(db=db, id=tenant_id)
        if not tenant_obj:
            raise HTTPException(status_code=404, detail="Tenant không tồn tại")
        
        # Get detailed statistics
        stats = get_tenant_statistics(db, tenant_id)
        
        # Get recent activities (bookings in last 7 days)
        seven_days_ago = datetime.now() - timedelta(days=7)
        recent_activities = db.query(TblBookingRequests).filter(
            and_(
                TblBookingRequests.tenant_id == tenant_id,
                TblBookingRequests.created_at >= seven_days_ago,
                TblBookingRequests.deleted == 0
            )
        ).order_by(TblBookingRequests.created_at.desc()).limit(10).all()
        
        activities_data = [
            {
                "id": activity.id,
                "customer_name": activity.customer_name,
                "status": activity.status,
                "total_amount": float(activity.total_amount or 0),
                "created_at": activity.created_at.isoformat()
            }
            for activity in recent_activities
        ]
        
        return {
            "success": True,
            "data": {
                "tenant_info": {
                    "id": tenant_obj.id,
                    "name": tenant_obj.name,
                    "domain": tenant_obj.domain,
                    "status": tenant_obj.status,
                    "created_at": tenant_obj.created_at.isoformat()
                },
                "statistics": stats,
                "recent_activities": activities_data
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi lấy thống kê: {str(e)}")
