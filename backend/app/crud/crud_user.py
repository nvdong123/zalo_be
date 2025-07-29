from sqlmodel import Session, select
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from typing import Optional, List
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    statement = select(User).offset(skip).limit(limit)
    return db.exec(statement).all()

def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.get(User, user_id)

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email)
    return db.exec(statement).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email)
    return db.exec(statement).first()

def create_user(db: Session, user: UserCreate) -> User:
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=get_password_hash(user.password),
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        merchant_id=user.merchant_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def update_user(db: Session, db_obj: User, obj_in: UserUpdate) -> User:
    obj_data = obj_in.dict(exclude_unset=True)
    if "password" in obj_data and obj_data["password"]:
        db_obj.hashed_password = get_password_hash(obj_data.pop("password"))
    for field, value in obj_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_user(db: Session, user_id: int) -> None:
    db_obj = db.get(User, user_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()


class UserCRUD:
    """CRUD operations for User"""
    
    def get(self, db: Session, id: int) -> Optional[User]:
        return get_user(db, id)
    
    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[User]:
        return get_users(db, skip, limit)
    
    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        return create_user(db, obj_in)
    
    def update(self, db: Session, *, db_obj: User, obj_in: UserUpdate) -> User:
        return update_user(db, db_obj, obj_in)
    
    def delete(self, db: Session, *, id: int) -> None:
        delete_user(db, id)
    
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return get_user_by_email(db, email)


# Create instance
user_crud = UserCRUD()
