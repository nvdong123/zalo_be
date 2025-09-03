from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.core.deps import get_db, get_current_admin_user, verify_tenant_permission
from app.models.models import TblAdminUsers, TblTenants
from app.schemas.admin_users import AdminUserCreate, AdminUserResponse, AdminUserUpdate
from app.crud.crud_admin_users import crud_admin_user

router = APIRouter()

@router.get("/admin-users", response_model=dict)
def get_admin_users(
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user),
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None)
):
    """
    Get all admin users with search and filter capabilities
    """
    # Only super_admin can view all admin users
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admin can view admin users"
        )
    
    # Build query
    query = db.query(TblAdminUsers).filter(TblAdminUsers.deleted == 0)
    
    # Add search filter
    if search:
        search_filter = or_(
            TblAdminUsers.username.ilike(f"%{search}%"),
            TblAdminUsers.email.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Add role filter
    if role:
        query = query.filter(TblAdminUsers.role == role)
    
    # Add status filter
    if is_active is not None:
        status_value = "active" if is_active else "inactive"
        query = query.filter(TblAdminUsers.status == status_value)
    
    # Get total count
    total = query.count()
    
    # Apply pagination and get results with tenant info
    users = query.offset(offset).limit(limit).all()
    
    # Enrich with tenant information
    result_data = []
    for user in users:
        user_dict = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "tenant_id": user.tenant_id,
            "is_active": user.status == "active",
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None,
            "tenant_name": None
        }
        
        # Get tenant name if user is hotel_admin
        if user.tenant_id:
            tenant = db.query(TblTenants).filter(
                and_(TblTenants.id == user.tenant_id, TblTenants.deleted == 0)
            ).first()
            if tenant:
                user_dict["tenant_name"] = tenant.name
        
        result_data.append(user_dict)
    
    return {
        "data": result_data,
        "total": total
    }

@router.post("/admin-users", response_model=AdminUserResponse)
def create_admin_user(
    user_in: AdminUserCreate,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    # Only super_admin can create admin users
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admin can create admin users"
        )
    
    # Check if user already exists
    if crud_admin_user.get_by_email(db, email=user_in.email):
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    if crud_admin_user.get_by_username(db, username=user_in.username):
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    user = crud_admin_user.create(
        db=db, 
        obj_in=user_in, 
        created_by=current_user.username
    )
    return user

@router.put("/admin-users/{user_id}", response_model=AdminUserResponse)
def update_admin_user(
    user_id: int,
    user_in: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    # Only super_admin can update admin users
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admin can update admin users"
        )
    
    user = crud_admin_user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check email uniqueness if email is being changed
    if user_in.email and user_in.email != user.email:
        if crud_admin_user.get_by_email(db, email=user_in.email):
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
    
    # Check username uniqueness if username is being changed
    if user_in.username and user_in.username != user.username:
        if crud_admin_user.get_by_username(db, username=user_in.username):
            raise HTTPException(
                status_code=400,
                detail="Username already registered"
            )
    
    user = crud_admin_user.update(
        db=db, 
        db_obj=user, 
        obj_in=user_in,
        updated_by=current_user.username
    )
    return user

@router.delete("/admin-users/{user_id}")
def delete_admin_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    # Only super_admin can delete admin users
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admin can delete admin users"
        )
    
    user = crud_admin_user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Cannot delete yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete yourself"
        )
    
    crud_admin_user.remove(db=db, id=user_id, deleted_by=current_user.username)
    return {"success": True, "message": "User deleted successfully"}

@router.get("/admin-users/me", response_model=AdminUserResponse)
def read_current_user(
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    return current_user
