from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from passlib.context import CryptContext
from datetime import datetime

from app.crud.base import CRUDBase
from app.models.models import TblAdminUsers
from app.schemas.admin_users import AdminUserCreate, AdminUserUpdate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class CRUDAdminUser(CRUDBase[TblAdminUsers, AdminUserCreate, AdminUserUpdate]):
    
    # Override get method since admin_users don't filter by tenant_id (they manage tenants)
    def get(self, db: Session, id: int) -> Optional[TblAdminUsers]:
        """Get single admin user by ID"""
        return db.query(TblAdminUsers).filter(
            and_(
                TblAdminUsers.id == id,
                TblAdminUsers.deleted == 0
            )
        ).first()
    
    def get_by_id(self, db: Session, *, id: int) -> Optional[TblAdminUsers]:
        """Get admin user by ID (no tenant filter needed)"""
        return self.get(db, id=id)

    def get_by_email(self, db: Session, *, email: str) -> Optional[TblAdminUsers]:
        """Get admin user by email"""
        return db.query(TblAdminUsers).filter(
            and_(
                TblAdminUsers.email == email,
                TblAdminUsers.deleted == 0
            )
        ).first()

    def get_by_username(self, db: Session, *, username: str) -> Optional[TblAdminUsers]:
        """Get admin user by username"""
        return db.query(TblAdminUsers).filter(
            and_(
                TblAdminUsers.username == username,
                TblAdminUsers.deleted == 0
            )
        ).first()

    def authenticate(self, db: Session, *, username: str, password: str) -> Optional[TblAdminUsers]:
        """Authenticate admin user"""
        user = self.get_by_username(db, username=username)
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password - support both bcrypt and simple hash for testing"""
        # Try bcrypt first
        if hashed_password.startswith('$2b$') or hashed_password.startswith('$2a$'):
            return pwd_context.verify(plain_password, hashed_password)
        
        # Fallback to simple hash for testing (SQLite data)
        import hashlib
        return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

    def get_password_hash(self, password: str) -> str:
        """Get password hash"""
        return pwd_context.hash(password)

    def create(
        self, 
        db: Session, 
        *, 
        obj_in: AdminUserCreate, 
        created_by: str = None
    ) -> TblAdminUsers:
        """Create admin user with hashed password - override to not require tenant_id"""
        hashed_password = self.get_password_hash(obj_in.password)
        
        # Convert obj_in to dict and handle password
        if isinstance(obj_in, dict):
            create_data = obj_in.copy()
        else:
            create_data = obj_in.dict(exclude_unset=True)
        
        # Remove password from create_data and add hashed_password
        create_data.pop("password", None)
        create_data["hashed_password"] = hashed_password
        
        if created_by:
            create_data["created_by"] = created_by
            
        db_obj = TblAdminUsers(**create_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: TblAdminUsers,
        obj_in: AdminUserUpdate,
        updated_by: str = None
    ) -> TblAdminUsers:
        """Update admin user - override to not require tenant_id"""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)

        # Handle password update
        if "password" in update_data and update_data["password"]:
            hashed_password = self.get_password_hash(update_data["password"])
            update_data.pop("password")
            update_data["hashed_password"] = hashed_password

        if updated_by:
            update_data["updated_by"] = updated_by

        for field, value in update_data.items():
            setattr(db_obj, field, value)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int, deleted_by: str = None) -> TblAdminUsers:
        """Soft delete admin user - override to not require tenant_id"""
        obj = db.query(TblAdminUsers).filter(
            and_(TblAdminUsers.id == id, TblAdminUsers.deleted == 0)
        ).first()
        if obj:
            obj.deleted = 1
            obj.deleted_at = datetime.now()
            if deleted_by:
                obj.deleted_by = deleted_by
            db.add(obj)
            db.commit()
        return obj

    def update_password(
        self,
        db: Session,
        *,
        db_obj: TblAdminUsers,
        new_password: str,
        updated_by: str = None
    ) -> TblAdminUsers:
        """Update admin user password"""
        hashed_password = self.get_password_hash(new_password)
        db_obj.hashed_password = hashed_password
        if updated_by:
            db_obj.updated_by = updated_by
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def is_active(self, user: TblAdminUsers) -> bool:
        """Check if user is active"""
        return user.is_active

    def is_super_admin(self, user: TblAdminUsers) -> bool:
        """Check if user is super admin"""
        return user.role == "super_admin"


crud_admin_user = CRUDAdminUser(TblAdminUsers)
