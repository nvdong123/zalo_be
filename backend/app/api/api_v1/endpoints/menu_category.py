from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional

from app.db.session import get_db
from app.models.menu_category import MenuCategory

router = APIRouter()

@router.get("/menu_category/")
def read_menu_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get list of menu categories"""
    try:
        print(f"Getting menu categories with skip={skip}, limit={limit}")
        
        # Direct SQLModel query
        categories = db.exec(select(MenuCategory).offset(skip).limit(limit)).all()
        print(f"Found {len(categories)} categories")
        
        # Convert to dict with exact fields from database
        result = []
        for category in categories:
            result.append({
                "id": category.id,
                "error": category.error,
                "message": category.message,
                "category_id": category.category_id,
                "category_name": category.category_name,
                "category_description": category.category_description,
                "merchant_id": category.merchant_id,
                "category_status": category.category_status,
                "created_at": category.created_at
            })
        
        # Return in format expected by frontend
        return {"data": result}
    except Exception as e:
        print(f"Error in read_menu_categories: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
