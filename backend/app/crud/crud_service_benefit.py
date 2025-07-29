from sqlmodel import Session, select
from app.models.service_benefit import ServiceBenefit
from app.schemas.service_benefit import ServiceBenefitCreate, ServiceBenefitUpdate
from typing import List, Optional

def get_service_benefits(db: Session, skip: int = 0, limit: int = 100) -> List[ServiceBenefit]:
    return db.exec(select(ServiceBenefit).offset(skip).limit(limit)).all()

def get_service_benefit(db: Session, service_benefit_id: int) -> Optional[ServiceBenefit]:
    return db.get(ServiceBenefit, service_benefit_id)

def create_service_benefit(db: Session, obj_in: ServiceBenefitCreate) -> ServiceBenefit:
    db_obj = ServiceBenefit(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_service_benefit(db: Session, db_obj: ServiceBenefit, obj_in: ServiceBenefitUpdate) -> ServiceBenefit:
    obj_data = obj_in.dict(exclude_unset=True)
    for field, value in obj_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_service_benefit(db: Session, service_benefit_id: int) -> None:
    db_obj = db.get(ServiceBenefit, service_benefit_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
