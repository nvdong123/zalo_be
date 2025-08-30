from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.core.deps import get_db, get_current_admin_user
from app.models.models import TblAdminUsers, TblTenants
from app.crud.crud_admin_users import crud_admin_user
from app.schemas.admin_users import AdminUserResponse

router = APIRouter()

class ProfileUpdateRequest(BaseModel):
    email: Optional[EmailStr] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

class SuccessResponse(BaseModel):
    message: str

class ProfileResponse(BaseModel):
    id: int
    username: str
    email: Optional[str]
    role: str
    tenant_id: Optional[int] = None
    tenant_name: Optional[str] = None
    status: str
    created_at: str
    updated_at: Optional[str] = None

@router.get("/profile/me", response_model=ProfileResponse)
def get_current_user_profile(
    current_user: TblAdminUsers = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get current user profile information
    """
    # Get tenant info if user is hotel_admin
    tenant_name = None
    if current_user.tenant_id:
        tenant = db.query(TblTenants).filter(
            TblTenants.id == current_user.tenant_id,
            TblTenants.deleted == 0
        ).first()
        if tenant:
            tenant_name = tenant.name

    return ProfileResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role,
        tenant_id=current_user.tenant_id,
        tenant_name=tenant_name,
        status=current_user.status,
        created_at=current_user.created_at.isoformat() if current_user.created_at else "",
        updated_at=current_user.updated_at.isoformat() if current_user.updated_at else None
    )

@router.put("/profile/me", response_model=ProfileResponse)
def update_current_user_profile(
    profile_data: ProfileUpdateRequest,
    current_user: TblAdminUsers = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update current user profile
    """
    # Validate current password if new password is provided
    if profile_data.new_password:
        if not profile_data.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required to change password"
            )
        
        # Verify current password
        if not crud_admin_user.verify_password(profile_data.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )

    # Check email uniqueness if email is being changed
    if profile_data.email and profile_data.email != current_user.email:
        existing_user = crud_admin_user.get_by_email(db, email=profile_data.email)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

    # Prepare update data
    update_data = {}
    if profile_data.email:
        update_data["email"] = profile_data.email
    if profile_data.new_password:
        update_data["password"] = profile_data.new_password

    # Update user
    if update_data:
        from app.schemas.admin_users import AdminUserUpdate
        update_obj = AdminUserUpdate(**update_data)
        updated_user = crud_admin_user.update(
            db=db,
            db_obj=current_user,
            obj_in=update_obj,
            updated_by=current_user.username
        )
    else:
        updated_user = current_user

    # Get tenant info for response
    tenant_name = None
    if updated_user.tenant_id:
        tenant = db.query(TblTenants).filter(
            TblTenants.id == updated_user.tenant_id,
            TblTenants.deleted == 0
        ).first()
        if tenant:
            tenant_name = tenant.name

    return ProfileResponse(
        id=updated_user.id,
        username=updated_user.username,
        email=updated_user.email,
        role=updated_user.role,
        tenant_id=updated_user.tenant_id,
        tenant_name=tenant_name,
        status=updated_user.status,
        created_at=updated_user.created_at.isoformat() if updated_user.created_at else "",
        updated_at=updated_user.updated_at.isoformat() if updated_user.updated_at else None
    )

@router.put("/profile/change-password", response_model=SuccessResponse)
def change_password(
    password_data: ChangePasswordRequest,
    current_user: TblAdminUsers = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Change user password
    """
    # Validate password confirmation
    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirmation do not match"
        )
    
    # Verify current password
    if not crud_admin_user.verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Update password
    from app.schemas.admin_users import AdminUserUpdate
    update_obj = AdminUserUpdate(password=password_data.new_password)
    crud_admin_user.update(
        db=db,
        db_obj=current_user,
        obj_in=update_obj,
        updated_by=current_user.username
    )
    
    return SuccessResponse(message="Password changed successfully")
