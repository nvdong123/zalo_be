from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session

from app.db.session import get_db
from app.models.ui_setting import UiSettingCreate, UiSettingUpdate, UiSettingResponse
from app.services.ui_setting_service import ui_setting_service
from app.core.deps import get_current_user, get_current_admin_user
from app.models.user import User

router = APIRouter()


@router.get("/my-ui-setting", response_model=Optional[UiSettingResponse])
def get_my_ui_setting(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Lấy UI setting của tenant hiện tại
    """
    ui_setting = ui_setting_service.get_ui_setting_by_tenant(
        db=db, 
        tenant_id=current_user.tenant_id or current_user.id
    )
    return ui_setting


@router.get("/{tenant_id}", response_model=Optional[UiSettingResponse])
def get_ui_setting_by_tenant(
    *,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Lấy UI setting theo tenant_id
    Chỉ có thể lấy setting của tenant mình hoặc admin có thể lấy bất kỳ
    """
    # Kiểm tra quyền
    user_tenant_id = current_user.tenant_id or current_user.id
    if tenant_id != user_tenant_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền truy cập UI setting của tenant khác"
        )
    
    ui_setting = ui_setting_service.get_ui_setting_by_tenant(
        db=db, 
        tenant_id=tenant_id
    )
    return ui_setting


@router.post("/", response_model=UiSettingResponse)
def create_ui_setting(
    *,
    db: Session = Depends(get_db),
    ui_setting_in: UiSettingCreate,
    current_user: User = Depends(get_current_user),
):
    """
    Tạo mới UI setting
    """
    user_tenant_id = current_user.tenant_id or current_user.id
    ui_setting = ui_setting_service.create_ui_setting(
        db=db,
        setting_data=ui_setting_in,
        current_tenant_id=user_tenant_id
    )
    return ui_setting


@router.put("/{tenant_id}", response_model=UiSettingResponse)
def update_ui_setting(
    *,
    tenant_id: int,
    db: Session = Depends(get_db),
    ui_setting_in: UiSettingUpdate,
    current_user: User = Depends(get_current_user),
):
    """
    Cập nhật UI setting theo tenant_id
    """
    user_tenant_id = current_user.tenant_id or current_user.id
    ui_setting = ui_setting_service.update_ui_setting(
        db=db,
        tenant_id=tenant_id,
        setting_data=ui_setting_in,
        current_tenant_id=user_tenant_id
    )
    return ui_setting


@router.put("/", response_model=UiSettingResponse)
def create_or_update_my_ui_setting(
    *,
    db: Session = Depends(get_db),
    ui_setting_in: UiSettingCreate,
    current_user: User = Depends(get_current_user),
):
    """
    Tạo mới hoặc cập nhật UI setting của tenant hiện tại
    """
    user_tenant_id = current_user.tenant_id or current_user.id
    
    # Set tenant_id từ user hiện tại
    ui_setting_in.tenant_id = user_tenant_id
    
    ui_setting = ui_setting_service.create_or_update_ui_setting(
        db=db,
        setting_data=ui_setting_in,
        current_tenant_id=user_tenant_id
    )
    return ui_setting


@router.delete("/{tenant_id}")
def delete_ui_setting(
    *,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Xóa UI setting theo tenant_id
    """
    user_tenant_id = current_user.tenant_id or current_user.id
    ui_setting_service.delete_ui_setting(
        db=db,
        tenant_id=tenant_id,
        current_tenant_id=user_tenant_id
    )
    return {"message": "Xóa UI setting thành công"}


# Admin endpoints
@router.get("/", response_model=List[UiSettingResponse])
def get_all_ui_settings(
    *,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
):
    """
    Lấy danh sách tất cả UI settings (chỉ admin)
    """
    ui_settings = ui_setting_service.get_all_ui_settings(
        db=db,
        skip=skip,
        limit=limit,
        is_admin=True
    )
    return ui_settings


@router.post("/admin/tenant/{tenant_id}", response_model=UiSettingResponse)
def admin_create_ui_setting(
    *,
    tenant_id: int,
    db: Session = Depends(get_db),
    ui_setting_in: UiSettingCreate,
    current_admin: User = Depends(get_current_admin_user),
):
    """
    Admin tạo UI setting cho tenant bất kỳ
    """
    # Set tenant_id từ path parameter
    ui_setting_in.tenant_id = tenant_id
    
    ui_setting = ui_setting_service.create_ui_setting(
        db=db,
        setting_data=ui_setting_in,
        current_tenant_id=tenant_id  # Admin có thể tạo cho bất kỳ tenant nào
    )
    return ui_setting


@router.put("/admin/tenant/{tenant_id}", response_model=UiSettingResponse)
def admin_update_ui_setting(
    *,
    tenant_id: int,
    db: Session = Depends(get_db),
    ui_setting_in: UiSettingUpdate,
    current_admin: User = Depends(get_current_admin_user),
):
    """
    Admin cập nhật UI setting cho tenant bất kỳ
    """
    ui_setting = ui_setting_service.update_ui_setting(
        db=db,
        tenant_id=tenant_id,
        setting_data=ui_setting_in,
        current_tenant_id=tenant_id  # Admin có thể cập nhật cho bất kỳ tenant nào
    )
    return ui_setting


@router.delete("/admin/tenant/{tenant_id}")
def admin_delete_ui_setting(
    *,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """
    Admin xóa UI setting của tenant bất kỳ
    """
    ui_setting_service.delete_ui_setting(
        db=db,
        tenant_id=tenant_id,
        current_tenant_id=tenant_id  # Admin có thể xóa cho bất kỳ tenant nào
    )
    return {"message": f"Xóa UI setting của tenant {tenant_id} thành công"}
