from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_admin_user, verify_tenant_permission
from app.models.models import TblAdminUsers
from app.schemas.admin_users import AdminUserCreate, AdminUserResponse, AdminUserUpdate
from app.crud.crud_admin_users import crud_admin_user

router = APIRouter()

@router.post("/admin-users/", response_model=AdminUserResponse)
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

@router.get("/admin-users/me", response_model=AdminUserResponse)
def read_current_user(
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    return current_user
