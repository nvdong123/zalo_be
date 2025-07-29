from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.service_benefit import ServiceBenefit, ServiceBenefitCreate, ServiceBenefitUpdate
from app.crud.crud_service_benefit import (
    get_service_benefits,
    get_service_benefit,
    create_service_benefit,
    update_service_benefit,
    delete_service_benefit,
)
from app.db.session import get_db

router = APIRouter()

@router.get("/service_benefit/", response_model=List[ServiceBenefit])
def read_service_benefits(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_service_benefits(db, skip=skip, limit=limit)

@router.get("/service_benefit/{service_benefit_id}", response_model=ServiceBenefit)
def read_service_benefit(service_benefit_id: int, db: Session = Depends(get_db)):
    db_obj = get_service_benefit(db, service_benefit_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="ServiceBenefit not found")
    return db_obj

@router.post("/service_benefit/", response_model=ServiceBenefit)
def create_service_benefit_view(obj_in: ServiceBenefitCreate, db: Session = Depends(get_db)):
    return create_service_benefit(db, obj_in)

@router.put("/service_benefit/{service_benefit_id}", response_model=ServiceBenefit)
def update_service_benefit_view(service_benefit_id: int, obj_in: ServiceBenefitUpdate, db: Session = Depends(get_db)):
    db_obj = get_service_benefit(db, service_benefit_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="ServiceBenefit not found")
    return update_service_benefit(db, db_obj, obj_in)

@router.delete("/service_benefit/{service_benefit_id}")
def delete_service_benefit_view(service_benefit_id: int, db: Session = Depends(get_db)):
    delete_service_benefit(db, service_benefit_id)
    return {"ok": True}
