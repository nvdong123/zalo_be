from sqlmodel import Session, select
from app.models.merchant import Merchant
from app.schemas.merchant import MerchantCreate, MerchantUpdate
from typing import List, Optional

def get_merchants(db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None) -> List[Merchant]:
    query = select(Merchant)
    
    if status:
        query = query.where(Merchant.status == status)
    
    return db.exec(query.offset(skip).limit(limit)).all()

def get_merchant(db: Session, merchant_id: int) -> Optional[Merchant]:
    return db.get(Merchant, merchant_id)

def get_merchant_by_merchant_id(db: Session, merchant_id_code: str) -> Optional[Merchant]:
    return db.exec(select(Merchant).where(Merchant.merchant_id == merchant_id_code)).first()

def create_merchant(db: Session, obj_in: MerchantCreate) -> Merchant:
    db_obj = Merchant(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_merchant(db: Session, db_obj: Merchant, obj_in: MerchantUpdate) -> Merchant:
    obj_data = obj_in.dict(exclude_unset=True)
    
    # Get valid fields from the model - use model_fields for Pydantic v2
    valid_fields = set(db_obj.model_fields.keys())
    
    # Filter out invalid fields
    filtered_data = {field: value for field, value in obj_data.items() if field in valid_fields}
    
    for field, value in filtered_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_merchant(db: Session, merchant_id: int) -> None:
    db_obj = db.get(Merchant, merchant_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
