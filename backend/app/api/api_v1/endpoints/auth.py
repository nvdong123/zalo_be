from datetime import datetime, timedelta
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt
from pydantic import BaseModel

from app.core.config import settings
from app.core.deps import get_db, get_current_admin_user
from app.crud.crud_admin_users import crud_admin_user
from app.schemas.admin_users import AdminUserResponse, AdminUserCreate
from app.models.models import TblTenants

router = APIRouter()


class Token(BaseModel):
    access_token: str
    token_type: str
    user_info: dict


class TokenData(BaseModel):
    user_id: int = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_info: AdminUserResponse
    tenant_info: Optional[dict] = None


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


@router.post("/login", response_model=LoginResponse)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    Enhanced with tenant information
    """
    user = crud_admin_user.authenticate(
        db, username=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive",
        )
    
    # Get tenant information if user belongs to a tenant
    tenant_info = None
    if user.tenant_id:
        tenant = db.query(TblTenants).filter(TblTenants.id == user.tenant_id).first()
        if tenant:
            tenant_info = {
                "id": tenant.id,
                "name": tenant.name,
                "domain": tenant.domain,
                "status": tenant.status
            }
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "tenant_id": user.tenant_id,
            "role": user.role,
            "username": user.username
        }, 
        expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_info=user,
        tenant_info=tenant_info
    )


@router.post("/test-token", response_model=AdminUserResponse)
def test_token(current_user: AdminUserResponse = Depends(get_current_admin_user)) -> Any:
    """
    Test access token
    """
    return current_user


@router.post("/register", response_model=AdminUserResponse)
def register_admin_user(
    user_data: AdminUserCreate,
    db: Session = Depends(get_db),
    current_user: AdminUserResponse = Depends(get_current_admin_user)
) -> Any:
    """
    Đăng ký admin user mới (chỉ super_admin hoặc admin có quyền)
    """
    # Kiểm tra quyền
    if current_user.role not in ["super_admin", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không đủ quyền để tạo user mới"
        )
    
    # Nếu không phải super_admin, chỉ được tạo user trong tenant của mình
    if current_user.role != "super_admin" and user_data.tenant_id != current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ được tạo user trong tenant của bạn"
        )
    
    # Kiểm tra username đã tồn tại
    existing_user = crud_admin_user.get_by_username(db, username=user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username đã tồn tại"
        )
    
    # Kiểm tra tenant tồn tại
    if user_data.tenant_id:
        tenant = db.query(TblTenants).filter(TblTenants.id == user_data.tenant_id).first()
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tenant không tồn tại"
            )
    
    # Tạo user mới
    new_user = crud_admin_user.create(db, obj_in=user_data)
    return new_user


@router.get("/me", response_model=AdminUserResponse)
def get_current_user_info(
    current_user: AdminUserResponse = Depends(get_current_admin_user)
) -> Any:
    """
    Lấy thông tin user hiện tại
    """
    return current_user


@router.post("/change-password")
def change_password(
    current_password: str,
    new_password: str,
    db: Session = Depends(get_db),
    current_user: AdminUserResponse = Depends(get_current_admin_user)
) -> Any:
    """
    Đổi mật khẩu
    """
    # Xác thực mật khẩu cũ
    user = crud_admin_user.authenticate(db, username=current_user.username, password=current_password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mật khẩu hiện tại không đúng"
        )
    
    # Cập nhật mật khẩu mới
    crud_admin_user.update_password(db, user_id=current_user.id, new_password=new_password)
    
    return {"message": "Đổi mật khẩu thành công"}
    user = crud_admin_user.authenticate(
        db, username=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive",
        )
    
    # Get tenant information if user belongs to a tenant
    tenant_info = None
    if user.tenant_id:
        tenant = db.query(TblTenants).filter(TblTenants.id == user.tenant_id).first()
        if tenant:
            tenant_info = {
                "id": tenant.id,
                "name": tenant.name,
                "domain": tenant.domain,
                "status": tenant.status
            }
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "tenant_id": user.tenant_id,
            "role": user.role,
            "username": user.username
        }, 
        expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_info=user,
        tenant_info=tenant_info
    )


@router.post("/test-token", response_model=AdminUserResponse)
def test_token(current_user: AdminUserResponse = Depends(get_current_admin_user)) -> Any:
    """
    Test access token
    """
    return current_user
