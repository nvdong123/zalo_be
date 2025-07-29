from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.schemas.merchant import Merchant, MerchantCreate, MerchantUpdate
from app.crud.crud_merchant import (
    get_merchants,
    get_merchant,
    get_merchant_by_merchant_id,
    create_merchant,
    update_merchant,
    delete_merchant,
)
from app.db.session import get_db

router = APIRouter()

@router.get("/merchant/stats")
def get_merchant_stats(db: Session = Depends(get_db)):
    """
    Lấy thống kê merchant
    """
    try:
        merchants = get_merchants(db, skip=0, limit=1000)
        total = len(merchants)
        active = len([m for m in merchants if m.status == "active"])
        inactive = total - active
        
        return {
            "data": {
                "totalMerchants": total,
                "totalActive": active,
                "totalInactive": inactive
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/merchant/")  # Tạm thời bỏ response_model
def read_merchants(
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter by status (ACTIVE, INACTIVE)"),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách các merchant.
    
    - **skip**: Số lượng bản ghi bỏ qua.
    - **limit**: Số lượng bản ghi tối đa trả về.
    - **status**: Lọc theo trạng thái.
    """
    try:
        print(f"Getting merchants with skip={skip}, limit={limit}, status={status}")
        merchants = get_merchants(db, skip=skip, limit=limit, status=status)
        print(f"Found {len(merchants)} merchants")
        # Convert to dict để tránh serialization issues
        result = []
        for merchant in merchants:
            result.append({
                "id": merchant.id,
                "error": merchant.error,
                "message": merchant.message,
                "merchant_id": merchant.merchant_id,
                "name": merchant.name,
                "phone": merchant.phone,
                "zalo_id": merchant.zalo_id,
                "email": merchant.email,
                "address": merchant.address,
                "code": merchant.code,
                "description": merchant.description,
                "logo_url": merchant.logo_url,
                "cover_url": merchant.cover_url,
                "status": merchant.status,
                "visible_order": merchant.visible_order,
                "oa": merchant.oa
            })
        return result
    except Exception as e:
        print(f"Error in read_merchants: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/merchant/{merchant_id}", response_model=Merchant)
def read_merchant(
    merchant_id: int = Path(..., description="ID của merchant"), 
    db: Session = Depends(get_db)
):
    """
    Lấy thông tin chi tiết của một merchant dựa trên ID.
    
    - **merchant_id**: ID của merchant.
    """
    db_obj = get_merchant(db, merchant_id)
    if db_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail={"error": 1, "message": "Merchant không tìm thấy"}
        )
    return db_obj

@router.get("/merchant/by-code/{merchant_code}", response_model=Merchant)
def read_merchant_by_code(
    merchant_code: str = Path(..., description="Merchant ID code"), 
    db: Session = Depends(get_db)
):
    """
    Lấy thông tin chi tiết của một merchant dựa trên merchant_id.
    
    - **merchant_code**: Merchant ID code.
    """
    db_obj = get_merchant_by_merchant_id(db, merchant_code)
    if db_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail={"error": 1, "message": "Merchant không tìm thấy"}
        )
    return db_obj

@router.post("/merchant/", response_model=Merchant, status_code=status.HTTP_201_CREATED)
def create_merchant_view(
    obj_in: MerchantCreate, 
    db: Session = Depends(get_db)
):
    """
    Tạo merchant mới.
    
    - **merchant_id**: ID của merchant (bắt buộc).
    - **name**: Tên merchant (bắt buộc).
    - Và các trường khác theo schema.
    """
    return create_merchant(db, obj_in)

@router.put("/merchant/{merchant_id}", response_model=Merchant)
def update_merchant_view(merchant_id: int, obj_in: MerchantUpdate, db: Session = Depends(get_db)):
    db_obj = get_merchant(db, merchant_id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="Merchant not found")
    return update_merchant(db, db_obj, obj_in)

@router.delete("/merchant/{merchant_id}")
def delete_merchant_view(merchant_id: int, db: Session = Depends(get_db)):
    delete_merchant(db, merchant_id)
    return {"ok": True}

@router.patch("/merchant/{merchant_id}/activate")
def activate_merchant_view(merchant_id: int, db: Session = Depends(get_db)):
    """
    Kích hoạt merchant
    """
    try:
        db_obj = get_merchant(db, merchant_id)
        if db_obj is None:
            raise HTTPException(status_code=404, detail="Merchant not found")
        
        # Update status to active
        updated_merchant = update_merchant(db, db_obj, MerchantUpdate(status="active"))
        return {"success": True, "message": "Merchant activated successfully", "data": updated_merchant}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/merchant/{merchant_id}/deactivate")
def deactivate_merchant_view(merchant_id: int, db: Session = Depends(get_db)):
    """
    Vô hiệu hóa merchant
    """
    try:
        db_obj = get_merchant(db, merchant_id)
        if db_obj is None:
            raise HTTPException(status_code=404, detail="Merchant not found")
        
        # Update status to inactive
        updated_merchant = update_merchant(db, db_obj, MerchantUpdate(status="inactive"))
        return {"success": True, "message": "Merchant deactivated successfully", "data": updated_merchant}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
