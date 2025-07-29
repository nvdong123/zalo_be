from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.service_image import ServiceImage, ServiceImageCreate, ServiceImageUpdate
from app.crud.crud_service_image import (
    get_service_images,
    get_service_image,
    create_service_image,
    update_service_image,
    delete_service_image,
)
from app.db.session import get_db

router = APIRouter()

@router.get("/service_image/", response_model=List[ServiceImage])
def read_service_images(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_service_images(db, skip=skip, limit=limit)

@router.get("/service_image/{service_image_id}", response_model=ServiceImage)
def read_service_image(service_image_id: int, db: Session = Depends(get_db)):
    db_obj = get_service_image(db, service_image_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="ServiceImage not found")
    return db_obj

@router.post("/service_image/", response_model=ServiceImage)
def create_service_image_view(obj_in: ServiceImageCreate, db: Session = Depends(get_db)):
    return create_service_image(db, obj_in)

@router.put("/service_image/{service_image_id}", response_model=ServiceImage)
def update_service_image_view(service_image_id: int, obj_in: ServiceImageUpdate, db: Session = Depends(get_db)):
    db_obj = get_service_image(db, service_image_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="ServiceImage not found")
    return update_service_image(db, db_obj, obj_in)

@router.delete("/service_image/{service_image_id}")
def delete_service_image_view(service_image_id: int, db: Session = Depends(get_db)):
    delete_service_image(db, service_image_id)
    return {"ok": True}
