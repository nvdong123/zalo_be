from typing import Optional, List
from sqlmodel import Session
from fastapi import HTTPException, status

from app.crud.crud_ui_setting import ui_setting_crud
from app.models.ui_setting import UiSetting, UiSettingCreate, UiSettingUpdate, UiSettingResponse


class UiSettingService:
    
    def __init__(self):
        self.crud = ui_setting_crud
    
    def get_ui_setting_by_tenant(
        self, 
        db: Session, 
        tenant_id: int
    ) -> Optional[UiSettingResponse]:
        """Lấy UI setting theo tenant_id"""
        ui_setting = self.crud.get_by_tenant_id(db, tenant_id)
        if not ui_setting:
            return None
        return UiSettingResponse.from_orm(ui_setting)
    
    def create_ui_setting(
        self, 
        db: Session, 
        *, 
        setting_data: UiSettingCreate,
        current_tenant_id: int
    ) -> UiSettingResponse:
        """Tạo mới UI setting"""
        # Kiểm tra quyền: chỉ có thể tạo setting cho tenant của mình
        if setting_data.tenant_id != current_tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền tạo UI setting cho tenant khác"
            )
        
        # Validate dữ liệu
        self._validate_ui_setting_data(setting_data)
        
        # Tạo mới
        ui_setting = self.crud.create(db, obj_in=setting_data)
        return UiSettingResponse.from_orm(ui_setting)
    
    def update_ui_setting(
        self, 
        db: Session, 
        *, 
        tenant_id: int,
        setting_data: UiSettingUpdate,
        current_tenant_id: int
    ) -> UiSettingResponse:
        """Cập nhật UI setting"""
        # Kiểm tra quyền: chỉ có thể cập nhật setting của tenant mình
        if tenant_id != current_tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền cập nhật UI setting của tenant khác"
            )
        
        # Validate dữ liệu
        self._validate_ui_setting_data(setting_data)
        
        # Cập nhật
        ui_setting = self.crud.update(
            db, 
            tenant_id=tenant_id, 
            obj_in=setting_data
        )
        return UiSettingResponse.from_orm(ui_setting)
    
    def delete_ui_setting(
        self, 
        db: Session, 
        *, 
        tenant_id: int,
        current_tenant_id: int
    ) -> bool:
        """Xóa UI setting"""
        # Kiểm tra quyền: chỉ có thể xóa setting của tenant mình
        if tenant_id != current_tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền xóa UI setting của tenant khác"
            )
        
        result = self.crud.delete(db, tenant_id=tenant_id)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy UI Setting cho tenant_id {tenant_id}"
            )
        return True
    
    def get_all_ui_settings(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        is_admin: bool = False
    ) -> List[UiSettingResponse]:
        """Lấy danh sách UI settings (chỉ admin)"""
        if not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Chỉ admin mới có quyền xem tất cả UI settings"
            )
        
        ui_settings = self.crud.get_multi(db, skip=skip, limit=limit)
        return [UiSettingResponse.from_orm(setting) for setting in ui_settings]
    
    def create_or_update_ui_setting(
        self, 
        db: Session, 
        *, 
        setting_data: UiSettingCreate,
        current_tenant_id: int
    ) -> UiSettingResponse:
        """Tạo mới hoặc cập nhật UI setting"""
        # Kiểm tra quyền
        if setting_data.tenant_id != current_tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền thao tác UI setting của tenant khác"
            )
        
        # Validate dữ liệu
        self._validate_ui_setting_data(setting_data)
        
        # Tạo hoặc cập nhật
        ui_setting = self.crud.create_or_update(
            db, 
            tenant_id=current_tenant_id,
            obj_in=setting_data
        )
        return UiSettingResponse.from_orm(ui_setting)
    
    def _validate_ui_setting_data(self, setting_data) -> None:
        """Validate dữ liệu UI setting"""
        # Kiểm tra màu sắc hợp lệ
        color_fields = ['background_color', 'primary_color', 'secondary_color', 'text_color']
        for field in color_fields:
            color_value = getattr(setting_data, field, None)
            if color_value and not self._is_valid_hex_color(color_value):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Màu {field} không hợp lệ. Vui lòng sử dụng format #RRGGBB"
                )
        
        # Kiểm tra theme_mode
        if hasattr(setting_data, 'theme_mode') and setting_data.theme_mode:
            if setting_data.theme_mode not in ['light', 'dark', 'auto']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="theme_mode chỉ có thể là 'light', 'dark', hoặc 'auto'"
                )
        
        # Kiểm tra logo_url
        if hasattr(setting_data, 'logo_url') and setting_data.logo_url:
            if not self._is_valid_url(setting_data.logo_url):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="logo_url không hợp lệ"
                )
    
    def _is_valid_hex_color(self, color: str) -> bool:
        """Kiểm tra màu hex hợp lệ"""
        import re
        pattern = r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
        return bool(re.match(pattern, color))
    
    def _is_valid_url(self, url: str) -> bool:
        """Kiểm tra URL hợp lệ"""
        import re
        pattern = r'^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$'
        return bool(re.match(pattern, url))


# Khởi tạo instance
ui_setting_service = UiSettingService()
