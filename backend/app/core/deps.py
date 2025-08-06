from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from pydantic import ValidationError

from app.db.session_local import get_db
from app.core.config import settings
from app.models.models import TblAdminUsers
from app.crud.crud_admin_users import crud_admin_user

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


def get_current_admin_user(
    db: Session = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> TblAdminUsers:
    """
    Get current admin user from JWT token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode JWT token
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except (JWTError, ValidationError):
        raise credentials_exception
    
    # Get admin user from database
    admin_user = crud_admin_user.get(db, id=int(user_id))
    if admin_user is None:
        raise credentials_exception
    
    return admin_user


def get_current_super_admin(
    current_user: TblAdminUsers = Depends(get_current_admin_user),
) -> TblAdminUsers:
    """
    Check if current user is super admin
    """
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required"
        )
    return current_user


def get_current_active_admin(
    current_user: TblAdminUsers = Depends(get_current_admin_user),
) -> TblAdminUsers:
    """
    Check if current admin user is active
    """
    if current_user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Admin user is not active"
        )
    return current_user


def get_current_hotel_admin(
    current_user: TblAdminUsers = Depends(get_current_admin_user),
) -> TblAdminUsers:
    """
    Check if current user is hotel admin
    """
    if current_user.role != "hotel_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hotel admin access required"
        )
    return current_user


def verify_tenant_permission(
    tenant_id: int,
    current_user: TblAdminUsers = Depends(get_current_admin_user)
) -> bool:
    """
    Verify tenant access permission
    - Super admin can access all tenants
    - Hotel admin can only access their assigned tenant
    """
    if current_user.role == "super_admin":
        return True
    
    if current_user.role == "hotel_admin" and current_user.tenant_id != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied for this tenant"
        )
    
    return True


def get_tenant_admin(
    tenant_id: int,
    current_user: TblAdminUsers = Depends(get_current_admin_user)
) -> TblAdminUsers:
    """
    Get admin user with tenant verification
    """
    verify_tenant_permission(tenant_id, current_user)
    return current_user
