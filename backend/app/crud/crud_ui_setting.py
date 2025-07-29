from typing import Optional, List
from sqlmodel import Session, select
from datetime import datetime

from app.models.ui_setting import UiSetting, UiSettingCreate, UiSettingUpdate
from fastapi import HTTPException, status


class UiSettingCRUD:
    
    def get_by_tenant_id(self, db: Session, tenant_id: int) -> Optional[UiSetting]:
        """Lấy UI setting theo tenant_id"""
        statement = select(UiSetting).where(UiSetting.tenant_id == tenant_id)
        result = db.exec(statement).first()
        return result
    
    def get_by_id(self, db: Session, setting_id: int) -> Optional[UiSetting]:
        """Lấy UI setting theo ID"""
        statement = select(UiSetting).where(UiSetting.id == setting_id)
        result = db.exec(statement).first()
        return result
    
    def create(self, db: Session, *, obj_in: UiSettingCreate) -> UiSetting:
        """Tạo mới UI setting"""
        # Kiểm tra xem tenant_id đã có setting chưa
        existing = self.get_by_tenant_id(db, obj_in.tenant_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"UI Setting cho tenant_id {obj_in.tenant_id} đã tồn tại. Vui lòng sử dụng API update."
            )
        
        db_obj = UiSetting.from_orm(obj_in)
        db_obj.created_at = datetime.utcnow()
        db_obj.updated_at = datetime.utcnow()
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(
        self, 
        db: Session, 
        *, 
        tenant_id: int,
        obj_in: UiSettingUpdate
    ) -> Optional[UiSetting]:
        """Cập nhật UI setting theo tenant_id"""
        db_obj = self.get_by_tenant_id(db, tenant_id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy UI Setting cho tenant_id {tenant_id}"
            )
        
        # Cập nhật các field có giá trị
        update_data = obj_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db_obj.updated_at = datetime.utcnow()
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def delete(self, db: Session, *, tenant_id: int) -> bool:
        """Xóa UI setting theo tenant_id"""
        db_obj = self.get_by_tenant_id(db, tenant_id)
        if not db_obj:
            return False
        
        db.delete(db_obj)
        db.commit()
        return True
    
    def get_multi(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[UiSetting]:
        """Lấy danh sách UI settings (cho admin)"""
        statement = select(UiSetting).offset(skip).limit(limit)
        results = db.exec(statement).all()
        return results
    
    def create_or_update(
        self, 
        db: Session, 
        *, 
        tenant_id: int,
        obj_in: UiSettingCreate
    ) -> UiSetting:
        """Tạo mới hoặc cập nhật UI setting"""
        existing = self.get_by_tenant_id(db, tenant_id)
        
        if existing:
            # Nếu đã tồn tại, cập nhật
            update_data = UiSettingUpdate(**obj_in.dict())
            return self.update(db, tenant_id=tenant_id, obj_in=update_data)
        else:
            # Nếu chưa tồn tại, tạo mới
            return self.create(db, obj_in=obj_in)


# Khởi tạo instance
ui_setting_crud = UiSettingCRUD()
