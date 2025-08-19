from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config_sqlite import settings

engine = create_engine(settings.DATABASE_URI, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
