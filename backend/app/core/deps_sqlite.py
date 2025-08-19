from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from pydantic import ValidationError

from app.db.session_sqlite import SessionLocal
from app.core.config_sqlite import settings
from app.models.models import TblAdminUsers
from app.crud.crud_admin_users import crud_admin_user

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_db() -> Generator:
    """Get database session"""
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_admin_user(
    db: Session = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> TblAdminUsers:
    """Get current authenticated admin user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
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
    
    user = crud_admin_user.get(db, id=int(user_id))
    if user is None:
        raise credentials_exception
    
    return user

def get_current_active_admin_user(
    current_user: TblAdminUsers = Depends(get_current_admin_user),
) -> TblAdminUsers:
    """Get current active admin user"""
    if hasattr(current_user, 'status') and current_user.status != "active":
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_super_admin(
    current_user: TblAdminUsers = Depends(get_current_active_admin_user),
) -> TblAdminUsers:
    """Get current super admin user"""
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user
