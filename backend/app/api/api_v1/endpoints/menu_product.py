from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional

from app.db.session import get_db
from app.models.menu_product import MenuProduct

router = APIRouter()

@router.get("/menu-products/")
def read_menu_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get list of menu products"""
    try:
        print(f"Getting menu products with skip={skip}, limit={limit}")
        
        # Build query with optional filters
        query = select(MenuProduct)
        if category_id:
            query = query.where(MenuProduct.category_id == category_id)
        if status:
            query = query.where(MenuProduct.status == status)
        
        products = db.exec(query.offset(skip).limit(limit)).all()
        print(f"Found {len(products)} products")
        
        # Convert to dict with exact fields from database
        result = []
        for product in products:
            result.append({
                "id": product.id,
                "category_id": product.category_id,
                "product_id": product.product_id,
                "name": product.name,
                "price": float(product.price),
                "sku": product.sku,
                "description": product.description,
                "image_url": product.image_url,
                "status": product.status
            })
        
        # Return in format expected by frontend
        return {"data": result}
    except Exception as e:
        print(f"Error in read_menu_products: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/menu-products/stats")
def get_menu_products_stats(db: Session = Depends(get_db)):
    """Get menu products statistics"""
    try:
        # Count total products
        total_products = len(db.exec(select(MenuProduct)).all())
        active_products = len(db.exec(select(MenuProduct).where(MenuProduct.status == "ACTIVE")).all())
        inactive_products = total_products - active_products
        
        # Calculate average price
        products = db.exec(select(MenuProduct)).all()
        avg_price = sum(p.price for p in products) / len(products) if products else 0
        
        return {
            "data": {
                "total": total_products,
                "active": active_products,
                "inactive": inactive_products,
                "average_price": round(avg_price, 2)
            }
        }
    except Exception as e:
        print(f"Error in get_menu_products_stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/menu-products/{product_id}")
def read_menu_product(product_id: int, db: Session = Depends(get_db)):
    """Get single menu product by ID"""
    try:
        product = db.exec(select(MenuProduct).where(MenuProduct.id == product_id)).first()
        if not product:
            raise HTTPException(status_code=404, detail="Menu product not found")
        
        result = {
            "id": product.id,
            "category_id": product.category_id,
            "product_id": product.product_id,
            "name": product.name,
            "price": float(product.price),
            "sku": product.sku,
            "description": product.description,
            "image_url": product.image_url,
            "status": product.status
        }
        return {"data": result}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in read_menu_product: {e}")
        raise HTTPException(status_code=500, detail=str(e))
