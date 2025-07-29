#!/usr/bin/env python3
"""
Test database connection script
"""
import sys
import traceback
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Database configuration
DATABASE_URL = "mysql+pymysql://bookingservicesiovn_zalominidb:VXpvfka7ON5DtJC1SW@157.66.81.101:3306/bookingservicesiovn_zalominidb"

def test_connection():
    """Test database connection"""
    try:
        print("Testing database connection...")
        print(f"Database URL: {DATABASE_URL.replace(':VXpvfka7ON5DtJC1SW@', ':****@')}")
        
        # Create engine
        engine = create_engine(DATABASE_URL)
        
        # Test connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT VERSION()"))
            version = result.fetchone()
            print(f"✅ Connection successful! Database version: {version[0]}")
            
            # Show tables
            result = connection.execute(text("SHOW TABLES"))
            tables = result.fetchall()
            print(f"✅ Found {len(tables)} tables:")
            for table in tables:
                print(f"  - {table[0]}")
                
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        print("\nFull error details:")
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
