from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List

from app.db.session import get_db
from app.models.promotion import Promotion

router = APIRouter()

@router.get("/promotions/")
def read_promotions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100), 
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách promotions theo database schema.
    """
    try:
        print(f"Getting promotions with skip={skip}, limit={limit}")
        
        # Direct SQLModel query
        promotions = db.exec(select(Promotion).offset(skip).limit(limit)).all()
        print(f"Found {len(promotions)} promotions")
        
        # Convert to dict với exact fields từ database
        result = []
        for promo in promotions:
            result.append({
                "id": promo.id,
                "error": promo.error,
                "message": promo.message,
                "promotion_id": promo.promotion_id,
                "title": promo.title,
                "type": promo.type,
                "image_url": promo.image_url,
                "description": promo.description,
                "start_date": promo.start_date,
                "end_date": promo.end_date,
                "time_remaining": promo.time_remaining,
                "discount_type": promo.discount_type,
                "discount_value": promo.discount_value,
                "suggest": promo.suggest
            })
        return result
    except Exception as e:
        print(f"Error in read_promotions: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/promotions/stats/")
def get_promotion_stats(db: Session = Depends(get_db)):
    """
    Lấy thống kê promotions.
    """
    try:
        promotions = db.exec(select(Promotion)).all()
        
        total = len(promotions)
        vouchers = len([p for p in promotions if p.type == 'voucher'])
        codes = len([p for p in promotions if p.type == 'code'])
        suggested = len([p for p in promotions if p.suggest])
        
        return {
            "total": total,
            "vouchers": vouchers, 
            "codes": codes,
            "suggested": suggested
        }
    except Exception as e:
        print(f"Error in get_promotion_stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/promotions/{id}")
def read_promotion(id: int, db: Session = Depends(get_db)):
    """
    Lấy promotion theo ID.
    """
    try:
        promotion = db.exec(select(Promotion).where(Promotion.id == id)).first()
        if not promotion:
            raise HTTPException(status_code=404, detail="Promotion not found")
        
        return {
            "id": promotion.id,
            "error": promotion.error,
            "message": promotion.message,
            "promotion_id": promotion.promotion_id,
            "title": promotion.title,
            "type": promotion.type,
            "image_url": promotion.image_url,
            "description": promotion.description,
            "start_date": promotion.start_date,
            "end_date": promotion.end_date,
            "time_remaining": promotion.time_remaining,
            "discount_type": promotion.discount_type,
            "discount_value": promotion.discount_value,
            "suggest": promotion.suggest
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in read_promotion: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/promotions/{id}")
def update_promotion(id: int, promotion_data: dict, db: Session = Depends(get_db)):
    """
    Cập nhật promotion.
    """
    try:
        promotion = db.exec(select(Promotion).where(Promotion.id == id)).first()
        if not promotion:
            raise HTTPException(status_code=404, detail="Promotion not found")
        
        # Get valid fields from the model
        valid_fields = set(Promotion.model_fields.keys())
        
        # Filter out invalid fields
        filtered_data = {field: value for field, value in promotion_data.items() if field in valid_fields}
        
        # Update only valid fields
        for field, value in filtered_data.items():
            if hasattr(promotion, field):
                setattr(promotion, field, value)
        
        db.add(promotion)
        db.commit()
        db.refresh(promotion)
        
        return {
            "id": promotion.id,
            "error": promotion.error,
            "message": promotion.message,
            "promotion_id": promotion.promotion_id,
            "title": promotion.title,
            "type": promotion.type,
            "image_url": promotion.image_url,
            "description": promotion.description,
            "start_date": promotion.start_date,
            "end_date": promotion.end_date,
            "time_remaining": promotion.time_remaining,
            "discount_type": promotion.discount_type,
            "discount_value": promotion.discount_value,
            "suggest": promotion.suggest
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in update_promotion: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/promotions/{id}")
def delete_promotion(id: int, db: Session = Depends(get_db)):
    """
    Xóa promotion.
    """
    try:
        promotion = db.exec(select(Promotion).where(Promotion.id == id)).first()
        if not promotion:
            raise HTTPException(status_code=404, detail="Promotion not found")
        
        db.delete(promotion)
        db.commit()
        
        return {"message": "Promotion deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in delete_promotion: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
