from sqlmodel import Session, select
from app.models.service_image import ServiceImage
from app.schemas.service_image import ServiceImageCreate, ServiceImageUpdate
from typing import List, Optional

def get_service_images(db: Session, skip: int = 0, limit: int = 100) -> List[ServiceImage]:
    return db.exec(select(ServiceImage).offset(skip).limit(limit)).all()

def get_service_image(db: Session, service_image_id: int) -> Optional[ServiceImage]:
    return db.get(ServiceImage, service_image_id)

def create_service_image(db: Session, obj_in: ServiceImageCreate) -> ServiceImage:
    db_obj = ServiceImage(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_service_image(db: Session, db_obj: ServiceImage, obj_in: ServiceImageUpdate) -> ServiceImage:
    obj_data = obj_in.dict(exclude_unset=True)
    for field, value in obj_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_service_image(db: Session, service_image_id: int) -> None:
    db_obj = db.get(ServiceImage, service_image_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
