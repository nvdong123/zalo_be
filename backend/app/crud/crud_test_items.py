from typing import Optional, List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.models import TblTestItems
from app.schemas.test_items import TestItemCreate, TestItemUpdate

class CRUDTestItem(CRUDBase[TblTestItems, TestItemCreate, TestItemUpdate]):
    def get_multi_by_status(
        self, db: Session, *, status: str = "active", skip: int = 0, limit: int = 100
    ) -> List[TblTestItems]:
        """Get test items by status"""
        return (
            db.query(TblTestItems)
            .filter(TblTestItems.status == status)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def search_by_name(
        self, db: Session, *, name: str, skip: int = 0, limit: int = 100
    ) -> List[TblTestItems]:
        """Search test items by name"""
        return (
            db.query(TblTestItems)
            .filter(TblTestItems.name.contains(name))
            .offset(skip)
            .limit(limit)
            .all()
        )

crud_test_item = CRUDTestItem(TblTestItems)
