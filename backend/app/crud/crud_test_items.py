from typing import Optional, List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.models import TblTestItems
from app.schemas.test_items import TestItemCreate, TestItemUpdate

class CRUDTestItem(CRUDBase[TblTestItems, TestItemCreate, TestItemUpdate]):
    def create(self, db: Session, *, obj_in: TestItemCreate) -> TblTestItems:
        """Create test item without tenant_id"""
        from datetime import datetime
        
        obj_in_data = obj_in.model_dump()
        obj_in_data["created_at"] = datetime.now()
        obj_in_data["updated_at"] = datetime.now()
        
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
        
    def get(self, db: Session, *, id: int) -> Optional[TblTestItems]:
        """Get test item by id (no tenant_id required)"""
        return db.query(self.model).filter(self.model.id == id).first()

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
