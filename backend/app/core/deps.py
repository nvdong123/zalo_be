from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from jose import jwt, JWTError
from pydantic import ValidationError

from app.db.session import get_db
from app.core.config import settings
from app.models.user import User
from app.crud.crud_user import user_crud

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


def get_current_user(
    db: Session = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Lấy thông tin user hiện tại từ JWT token
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
    
    # Lấy user từ database
    user = user_crud.get(db, id=int(user_id))
    if user is None:
        raise credentials_exception
    
    return user


def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Kiểm tra user hiện tại có quyền admin không
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền admin"
        )
    return current_user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Kiểm tra user hiện tại có active không
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="User không active"
        )
    return current_user


def get_current_merchant_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Kiểm tra user hiện tại có phải merchant không
    """
    if current_user.role != "merchant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ merchant mới có quyền truy cập"
        )
    return current_user


def verify_tenant_permission(
    tenant_id: int,
    current_user: User = Depends(get_current_user)
) -> bool:
    """
    Kiểm tra quyền truy cập tenant
    - Admin có thể truy cập tất cả tenant
    - User chỉ có thể truy cập tenant của mình
    """
    if current_user.is_admin:
        return True
    
    user_tenant_id = current_user.tenant_id or current_user.id
    if tenant_id != user_tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền truy cập tenant này"
        )
    
    return True
