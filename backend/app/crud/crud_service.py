from sqlmodel import Session, select
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate
from typing import List, Optional

def get_services(db: Session, skip: int = 0, limit: int = 100) -> List[Service]:
    return db.exec(select(Service).offset(skip).limit(limit)).all()

def get_service(db: Session, service_id: int) -> Optional[Service]:
    return db.get(Service, service_id)

def create_service(db: Session, obj_in: ServiceCreate) -> Service:
    db_obj = Service(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_service(db: Session, db_obj: Service, obj_in: ServiceUpdate) -> Service:
    obj_data = obj_in.dict(exclude_unset=True)
    for field, value in obj_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_service(db: Session, service_id: int) -> None:
    db_obj = db.get(Service, service_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
