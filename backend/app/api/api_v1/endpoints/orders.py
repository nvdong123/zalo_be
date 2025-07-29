from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional

from app.db.session import get_db
from app.models.orders import Orders

router = APIRouter()

@router.get("/orders/")
def read_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách orders theo database schema.
    """
    try:
        print(f"Getting orders with skip={skip}, limit={limit}, status={status}")
        
        # Build query with optional status filter
        query = select(Orders)
        if status:
            query = query.where(Orders.status == status)
        
        orders = db.exec(query.offset(skip).limit(limit)).all()
        print(f"Found {len(orders)} orders")
        
        # Convert to dict với exact fields từ database
        result = []
        for order in orders:
            result.append({
                "id": order.id,
                "error": order.error,
                "message": order.message,
                "order_id": order.order_id,
                "status": order.status,
                "created_at": order.created_at,
                "total": float(order.total)
            })
        
        # Return in format expected by frontend
        return {"data": result}
    except Exception as e:
        print(f"Error in read_orders: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/orders/")
def create_order(order_data: dict, db: Session = Depends(get_db)):
    """
    Tạo order mới.
    """
    try:
        import time
        from decimal import Decimal
        
        # Create order with proper data types and required fields
        new_order = Orders(
            error=order_data.get('error', 0),
            message=order_data.get('message', "New order created"),
            order_id=int(order_data.get('order_id', int(time.time()))),
            status=order_data.get('status', "pending"),
            created_at=order_data.get('created_at', int(time.time())),
            total=Decimal(str(order_data.get('total', 0)))
        )
        
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        
        return {
            "id": new_order.id,
            "error": new_order.error,
            "message": new_order.message,
            "order_id": new_order.order_id,
            "status": new_order.status,
            "created_at": new_order.created_at,
            "total": float(new_order.total) if new_order.total else 0.0
        }
    except Exception as e:
        print(f"Error in create_order: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orders/{order_id}")
def read_order(order_id: int, db: Session = Depends(get_db)):
    """Get single order by ID"""
    try:
        order = db.exec(select(Orders).where(Orders.id == order_id)).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        result = {
            "id": order.id,
            "error": order.error,
            "message": order.message,
            "order_id": order.order_id,
            "status": order.status,
            "created_at": order.created_at,
            "total": float(order.total)
        }
        return {"data": result}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in read_order: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/orders/{order_id}")
def update_order(order_id: int, order_data: dict, db: Session = Depends(get_db)):
    """Update order"""
    try:
        order = db.exec(select(Orders).where(Orders.id == order_id)).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Update allowed fields
        if "status" in order_data:
            order.status = order_data["status"]
        if "total" in order_data:
            order.total = order_data["total"]
        
        db.add(order)
        db.commit()
        db.refresh(order)
        
        result = {
            "id": order.id,
            "error": order.error,
            "message": order.message,
            "order_id": order.order_id,
            "status": order.status,
            "created_at": order.created_at,
            "total": float(order.total)
        }
        return {"data": result}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in update_order: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/orders/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete order"""
    try:
        order = db.exec(select(Orders).where(Orders.id == order_id)).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        db.delete(order)
        db.commit()
        
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in delete_order: {e}")
        raise HTTPException(status_code=500, detail=str(e))
