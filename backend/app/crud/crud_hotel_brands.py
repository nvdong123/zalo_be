from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.models.models import TblHotelBrands
from app.schemas.hotel_brands import HotelBrandCreate, HotelBrandUpdate


class CRUDHotelBrand(CRUDBase[TblHotelBrands, HotelBrandCreate, HotelBrandUpdate]):
    def get_by_name(
        self, 
        db: Session, 
        *, 
        brand_name: str,
        tenant_id: int
    ) -> Optional[TblHotelBrands]:
        """Get hotel brand by name"""
        return db.query(TblHotelBrands).filter(
            and_(
                TblHotelBrands.brand_name == brand_name,
                TblHotelBrands.tenant_id == tenant_id,
                TblHotelBrands.deleted == 0
            )
        ).first()

    def get_active_brands(
        self,
        db: Session,
        *,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblHotelBrands]:
        """Get active hotel brands"""
        return db.query(TblHotelBrands).filter(
            and_(
                TblHotelBrands.is_active == True,
                TblHotelBrands.tenant_id == tenant_id,
                TblHotelBrands.deleted == 0
            )
        ).offset(skip).limit(limit).all()


hotel_brand = CRUDHotelBrand(TblHotelBrands)
