#!/usr/bin/env python3
"""
Test multiple database connection configurations
"""
import sys
import traceback
from sqlalchemy import create_engine, text

# Test configurations
configs = [
    # Standard port 3306
    {
        "name": "Port 3306",
        "url": "mysql+pymysql://bookingservicesiovn_zalominidb:VXpvfka7ON5DtJC1SW@157.66.81.101:3306/bookingservicesiovn_zalominidb"
    },
    # Alternative port 3307
    {
        "name": "Port 3307", 
        "url": "mysql+pymysql://bookingservicesiovn_zalominidb:VXpvfka7ON5DtJC1SW@157.66.81.101:3307/bookingservicesiovn_zalominidb"
    },
    # Without specifying port (default)
    {
        "name": "Default port",
        "url": "mysql+pymysql://bookingservicesiovn_zalominidb:VXpvfka7ON5DtJC1SW@157.66.81.101/bookingservicesiovn_zalominidb"
    }
]

def test_config(config):
    """Test a specific configuration"""
    try:
        print(f"\n🔄 Testing {config['name']}...")
        print(f"URL: {config['url'].replace(':VXpvfka7ON5DtJC1SW@', ':****@')}")
        
        engine = create_engine(config['url'], connect_args={"connect_timeout": 10})
        
        with engine.connect() as connection:
            result = connection.execute(text("SELECT VERSION()"))
            version = result.fetchone()
            print(f"✅ SUCCESS! Database version: {version[0]}")
            
            # Show tables
            result = connection.execute(text("SHOW TABLES"))
            tables = result.fetchall()
            print(f"✅ Found {len(tables)} tables")
            return True
            
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False

def main():
    """Test all configurations"""
    print("🚀 Testing database connections with different configurations...")
    
    success_count = 0
    for config in configs:
        if test_config(config):
            success_count += 1
    
    print(f"\n📊 Results: {success_count}/{len(configs)} configurations successful")
    
    if success_count == 0:
        print("\n💡 Suggestions:")
        print("1. Check database credentials in DirectAdmin")
        print("2. Verify user permissions for remote connections")
        print("3. Check if MySQL/MariaDB service is running")
        print("4. Try connecting from a different tool (phpMyAdmin, MySQL Workbench)")

if __name__ == "__main__":
    main()
