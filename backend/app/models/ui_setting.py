from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from typing import Optional
import uuid


class UiSettingBase(SQLModel):
    tenant_id: int = Field(index=True, description="ID của merchant/tenant")
    background_color: str = Field(
        default="#ffffff", 
        max_length=7, 
        regex=r"^#[0-9A-Fa-f]{6}$",
        description="Màu nền hex code, ví dụ: #ffffff"
    )
    primary_color: Optional[str] = Field(
        default="#1890ff",
        max_length=7,
        regex=r"^#[0-9A-Fa-f]{6}$",
        description="Màu chính của app"
    )
    secondary_color: Optional[str] = Field(
        default="#52c41a",
        max_length=7,
        regex=r"^#[0-9A-Fa-f]{6}$",
        description="Màu phụ của app"
    )
    text_color: Optional[str] = Field(
        default="#000000",
        max_length=7,
        regex=r"^#[0-9A-Fa-f]{6}$",
        description="Màu chữ chính"
    )
    font_family: Optional[str] = Field(
        default="system-ui",
        max_length=100,
        description="Font chữ sử dụng"
    )
    logo_url: Optional[str] = Field(
        default=None,
        max_length=500,
        description="URL logo của merchant"
    )
    theme_mode: Optional[str] = Field(
        default="light",
        regex=r"^(light|dark|auto)$",
        description="Chế độ theme: light, dark, auto"
    )


class UiSetting(UiSettingBase, table=True):
    __tablename__ = "ui_settings"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship với merchant nếu cần
    # merchant: Optional["Merchant"] = Relationship(back_populates="ui_setting")


class UiSettingCreate(UiSettingBase):
    pass


class UiSettingUpdate(SQLModel):
    background_color: Optional[str] = Field(
        default=None,
        max_length=7,
        regex=r"^#[0-9A-Fa-f]{6}$",
        description="Màu nền hex code"
    )
    primary_color: Optional[str] = Field(
        default=None,
        max_length=7,
        regex=r"^#[0-9A-Fa-f]{6}$"
    )
    secondary_color: Optional[str] = Field(
        default=None,
        max_length=7,
        regex=r"^#[0-9A-Fa-f]{6}$"
    )
    text_color: Optional[str] = Field(
        default=None,
        max_length=7,
        regex=r"^#[0-9A-Fa-f]{6}$"
    )
    font_family: Optional[str] = Field(default=None, max_length=100)
    logo_url: Optional[str] = Field(default=None, max_length=500)
    theme_mode: Optional[str] = Field(
        default=None,
        regex=r"^(light|dark|auto)$"
    )


class UiSettingRead(UiSettingBase):
    id: int
    created_at: datetime
    updated_at: datetime


class UiSettingResponse(SQLModel):
    success: bool = True
    message: str = "Success"
    data: Optional[UiSettingRead] = None
