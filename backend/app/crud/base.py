from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime

from app.db.session_local import SessionLocal
from app.models.models import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        """
        CRUD object with default methods to Create, Read, Update, Delete (CRUD).
        **Parameters**
        * `model`: A SQLAlchemy model class
        * `schema`: A Pydantic model (schema) class
        """
        self.model = model

    def get(self, db: Session, id: Any, tenant_id: int) -> Optional[ModelType]:
        """Get single record by ID and tenant"""
        return db.query(self.model).filter(
            and_(
                self.model.id == id,
                self.model.tenant_id == tenant_id,
                self.model.deleted == 0
            )
        ).first()

    def get_multi(
        self,
        db: Session,
        *,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100,
        include_deleted: bool = False
    ) -> List[ModelType]:
        """Get multiple records for a tenant"""
        query = db.query(self.model).filter(self.model.tenant_id == tenant_id)
        
        if not include_deleted:
            query = query.filter(self.model.deleted == 0)
            
        return query.offset(skip).limit(limit).all()

    def get_count(
        self,
        db: Session,
        *,
        tenant_id: int,
        include_deleted: bool = False
    ) -> int:
        """Get total count of records for a tenant"""
        query = db.query(func.count(self.model.id)).filter(self.model.tenant_id == tenant_id)
        
        if not include_deleted:
            query = query.filter(self.model.deleted == 0)
            
        return query.scalar()

    def create(
        self, 
        db: Session, 
        *, 
        obj_in: CreateSchemaType, 
        tenant_id: int,
        created_by: str = None
    ) -> ModelType:
        """Create new record"""
        obj_in_data = jsonable_encoder(obj_in)
        
        # Add tenant_id and audit fields
        obj_in_data["tenant_id"] = tenant_id
        if created_by:
            obj_in_data["created_by"] = created_by
            
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]],
        updated_by: str = None
    ) -> ModelType:
        """Update existing record"""
        obj_data = jsonable_encoder(db_obj)
        
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
            
        # Add audit field
        if updated_by:
            update_data["updated_by"] = updated_by
            
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
                
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(
        self, 
        db: Session, 
        *, 
        id: int, 
        tenant_id: int,
        deleted_by: str = None
    ) -> Optional[ModelType]:
        """Soft delete record"""
        obj = self.get(db=db, id=id, tenant_id=tenant_id)
        if obj:
            obj.deleted = 1
            obj.deleted_at = datetime.utcnow()
            if deleted_by:
                obj.deleted_by = deleted_by
            db.add(obj)
            db.commit()
            db.refresh(obj)
        return obj

    def restore(
        self, 
        db: Session, 
        *, 
        id: int, 
        tenant_id: int,
        updated_by: str = None
    ) -> Optional[ModelType]:
        """Restore soft deleted record"""
        obj = db.query(self.model).filter(
            and_(
                self.model.id == id,
                self.model.tenant_id == tenant_id,
                self.model.deleted == 1
            )
        ).first()
        
        if obj:
            obj.deleted = 0
            obj.deleted_at = None
            obj.deleted_by = None
            if updated_by:
                obj.updated_by = updated_by
            db.add(obj)
            db.commit()
            db.refresh(obj)
        return obj

    def hard_delete(
        self, 
        db: Session, 
        *, 
        id: int, 
        tenant_id: int
    ) -> Optional[ModelType]:
        """Permanently delete record"""
        obj = self.get(db=db, id=id, tenant_id=tenant_id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj
