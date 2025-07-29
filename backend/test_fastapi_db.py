#!/usr/bin/env python3
"""
Test FastAPI database connection without starting server
"""
import sys
import os
import traceback

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import engine, get_db
from app.core.config import settings
from sqlalchemy import text

def test_fastapi_db_connection():
    """Test database connection using FastAPI configuration"""
    try:
        print("🔄 Testing FastAPI database connection...")
        print(f"📊 Database: {settings.MYSQL_DB}")
        print(f"🏠 Host: {settings.MYSQL_SERVER}")
        print(f"👤 User: {settings.MYSQL_USER}")
        print(f"🔗 Database URI: {settings.DATABASE_URI.replace(settings.MYSQL_PASSWORD, '****')}")
        
        # Test connection using the engine from session.py
        with engine.connect() as connection:
            result = connection.execute(text("SELECT VERSION()"))
            version = result.fetchone()
            print(f"✅ Connection successful! Database version: {version[0]}")
            
            # Show tables
            result = connection.execute(text("SHOW TABLES"))
            tables = result.fetchall()
            print(f"✅ Found {len(tables)} tables:")
            for table in tables[:10]:  # Show first 10 tables
                print(f"  - {table[0]}")
            
            if len(tables) > 10:
                print(f"  ... and {len(tables) - 10} more tables")
                
            return True
            
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        print("\nFull error details:")
        traceback.print_exc()
        return False

def test_db_session():
    """Test database session (dependency injection)"""
    try:
        print("\n🔄 Testing database session...")
        
        # Test get_db function
        db = next(get_db())
        result = db.execute(text("SELECT 1 as test"))
        test_result = result.fetchone()
        print(f"✅ Session test successful: {test_result[0]}")
        db.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Session test failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 FastAPI Database Connection Test")
    print("=" * 50)
    
    # Test engine connection
    engine_success = test_fastapi_db_connection()
    
    # Test session
    session_success = test_db_session() if engine_success else False
    
    print("\n" + "=" * 50)
    if engine_success and session_success:
        print("✅ All tests passed! FastAPI can connect to database.")
        sys.exit(0)
    else:
        print("❌ Some tests failed. Check database configuration.")
        sys.exit(1)
