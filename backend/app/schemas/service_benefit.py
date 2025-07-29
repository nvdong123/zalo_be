from pydantic import BaseModel
from typing import Optional

class ServiceBenefitBase(BaseModel):
    service_id: Optional[int] = None
    benefit: str

class ServiceBenefitCreate(ServiceBenefitBase):
    pass

class ServiceBenefitUpdate(BaseModel):
    service_id: Optional[int] = None
    benefit: Optional[str] = None

class ServiceBenefitInDBBase(ServiceBenefitBase):
    id: int
    class Config:
        orm_mode = True

class ServiceBenefit(ServiceBenefitInDBBase):
    pass
