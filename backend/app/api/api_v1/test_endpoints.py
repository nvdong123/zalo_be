from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from ...db.session import get_db
from ...models.orders import Orders
from ...models.promotion import Promotion

router = APIRouter()

@router.get("/test/orders")
def test_orders(db: Session = Depends(get_db)):
    """Simple orders test endpoint"""
    orders = db.exec(select(Orders).limit(10)).all()
    result = []
    for order in orders:
        result.append({
            "id": order.id,
            "order_id": order.order_id,
            "status": order.status,
            "total": float(order.total),
            "created_at": order.created_at
        })
    return {"count": len(result), "data": result}

@router.get("/test/promotions")
def test_promotions(db: Session = Depends(get_db)):
    """Simple promotions test endpoint"""
    promotions = db.exec(select(Promotion).limit(10)).all()
    result = []
    for promo in promotions:
        result.append({
            "id": promo.id,
            "promotion_id": promo.promotion_id,
            "title": promo.title,
            "type": promo.type,
            "discount_value": promo.discount_value
        })
    return {"count": len(result), "data": result}
