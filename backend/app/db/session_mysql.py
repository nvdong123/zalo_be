from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config_local_mysql import settings

# MySQL compatible engine configuration
engine = create_engine(
    settings.DATABASE_URI, 
    echo=True,
    pool_pre_ping=True,
    pool_recycle=300,
    # Remove connect_timeout as it's not supported by PyMySQL
    # Use charset in the URI instead
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
