"""
Database configuration for production using existing MySQL setup
"""
import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.production')

# Database configuration using existing MySQL
MYSQL_HOST = os.getenv("DB_HOST", "localhost")
MYSQL_PORT = os.getenv("DB_PORT", "3306")
MYSQL_USER = os.getenv("DB_USER", "hotel_app_user")
MYSQL_PASSWORD = os.getenv("DB_PASSWORD", "HotelApp2025!@#Secure")
MYSQL_DATABASE = os.getenv("DB_NAME", "bookingservicesiovn_zalominidb")

# URL encode password to handle special characters
ENCODED_PASSWORD = urllib.parse.quote_plus(MYSQL_PASSWORD)

# Construct database URL with proper encoding
DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{ENCODED_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"

print(f"🔍 Database config: {MYSQL_USER}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}")

# SQLAlchemy engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False  # Set to True for SQL debugging
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_database_url():
    """Get the database URL for migrations and other tools"""
    return DATABASE_URL

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection():
    """Test database connection"""
    try:
        with engine.connect() as connection:
            result = connection.execute("SELECT 1")
            return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

# Database health check
def health_check():
    """Health check for monitoring"""
    try:
        with engine.connect() as connection:
            result = connection.execute("SELECT VERSION()")
            version = result.fetchone()[0]
            return {
                "status": "healthy",
                "database": "mysql",
                "version": version,
                "host": MYSQL_HOST,
                "database_name": MYSQL_DATABASE
            }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "database": "mysql",
            "host": MYSQL_HOST,
            "database_name": MYSQL_DATABASE
        }
