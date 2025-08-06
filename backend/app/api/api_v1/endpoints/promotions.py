from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.crud.crud_promotions import promotion
from app.schemas.promotions import PromotionCreate, PromotionRead, PromotionUpdate

router = APIRouter()

@router.get("/promotions", response_model=List[PromotionRead])
def read_promotions(
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all promotions for a tenant"""
    return promotion.get_multi(db=db, tenant_id=tenant_id, skip=skip, limit=limit)

@router.post("/promotions", response_model=PromotionRead)
def create_promotion(
    *,
    tenant_id: int,
    obj_in: PromotionCreate,
    db: Session = Depends(get_db)
):
    """Create new promotion"""
    return promotion.create(db=db, obj_in=obj_in, tenant_id=tenant_id)

@router.get("/promotions/{item_id}", response_model=PromotionRead)
def read_promotion(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db)
):
    """Get promotion by ID"""
    obj = promotion.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return obj

@router.put("/promotions/{item_id}", response_model=PromotionRead)
def update_promotion(
    *,
    item_id: int,
    tenant_id: int,
    obj_in: PromotionUpdate,
    db: Session = Depends(get_db)
):
    """Update promotion"""
    obj = promotion.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return promotion.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/promotions/{item_id}")
def delete_promotion(
    *,
    item_id: int,
    tenant_id: int,
    deleted_by: str = None,
    db: Session = Depends(get_db)
):
    """Delete promotion"""
    obj = promotion.remove(db=db, id=item_id, tenant_id=tenant_id, deleted_by=deleted_by)
    if not obj:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return {"message": "Promotion deleted successfully"}
