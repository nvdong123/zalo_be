from pydantic import BaseModel
from typing import Optional
import datetime
import decimal

class VoucherBase(BaseModel):
    tenant_id: int
    voucher_code: str
    description: Optional[str] = None
    discount_type: str  # percentage or fixed
    discount_value: decimal.Decimal
    min_order_value: Optional[decimal.Decimal] = None
    max_discount: Optional[decimal.Decimal] = None
    start_date: datetime.datetime
    end_date: datetime.datetime
    usage_limit: Optional[int] = None
    usage_count: int = 0
    status: str = 'active'
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    deleted: Optional[int] = None
    deleted_at: Optional[datetime.datetime] = None
    deleted_by: Optional[str] = None

class VoucherCreate(VoucherBase):
    pass

class VoucherRead(VoucherBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class VoucherUpdate(VoucherBase):
    pass
