from typing import Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.crud.base import CRUDBase
from app.models.models import TblAdminUsers
from app.schemas.admin_users import AdminUserCreate, AdminUserUpdate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class CRUDAdminUser(CRUDBase[TblAdminUsers, AdminUserCreate, AdminUserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[TblAdminUsers]:
        """Get admin user by email"""
        query = db.query(TblAdminUsers).filter(TblAdminUsers.email == email)
        # Check if the model has 'deleted' column
        if hasattr(TblAdminUsers, 'deleted'):
            query = query.filter(TblAdminUsers.deleted == 0)
        return query.first()

    def get_by_username(self, db: Session, *, username: str) -> Optional[TblAdminUsers]:
        """Get admin user by username"""
        query = db.query(TblAdminUsers).filter(TblAdminUsers.username == username)
        # Check if the model has 'deleted' column
        if hasattr(TblAdminUsers, 'deleted'):
            query = query.filter(TblAdminUsers.deleted == 0)
        return query.first()

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
        """Create admin user with hashed password"""
        hashed_password = self.get_password_hash(obj_in.password)
        
        # Remove password from obj_in and add hashed_password
        create_data = obj_in.dict(exclude={"password"})
        create_data["hashed_password"] = hashed_password
        
        db_obj = TblAdminUsers(
            **create_data,
            created_by=created_by
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

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
