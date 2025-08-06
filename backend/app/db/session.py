from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Sử dụng cấu hình từ settings
engine = create_engine(
    settings.DATABASE_URI, 
    echo=True,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={"connect_timeout": 60}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=Session)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
