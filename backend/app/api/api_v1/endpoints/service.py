from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.service import Service, ServiceCreate, ServiceUpdate
from app.crud.crud_service import (
    get_services,
    get_service,
    create_service,
    update_service,
    delete_service,
)
from app.db.session import get_db

router = APIRouter()

@router.get("/service/", response_model=List[Service])
def read_services(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_services(db, skip=skip, limit=limit)

@router.get("/service/{service_id}", response_model=Service)
def read_service(service_id: int, db: Session = Depends(get_db)):
    db_obj = get_service(db, service_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_obj

@router.post("/service/", response_model=Service)
def create_service_view(obj_in: ServiceCreate, db: Session = Depends(get_db)):
    return create_service(db, obj_in)

@router.put("/service/{service_id}", response_model=Service)
def update_service_view(service_id: int, obj_in: ServiceUpdate, db: Session = Depends(get_db)):
    db_obj = get_service(db, service_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return update_service(db, db_obj, obj_in)

@router.delete("/service/{service_id}")
def delete_service_view(service_id: int, db: Session = Depends(get_db)):
    delete_service(db, service_id)
    return {"ok": True}
