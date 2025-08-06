#!/bin/bash
# Configure Existing MySQL for Hotel Management System
# This script configures your existing MySQL installation with da_admin user

echo "🔒 Configuring Existing MySQL for Hotel Management System"
echo "========================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Your existing MySQL credentials
MYSQL_USER="da_admin"
MYSQL_PASS="C8tZ5WfPAxAPfBso"
MYSQL_HOST="localhost"
MYSQL_PORT="3306"

# Application database configuration
DB_NAME="bookingservicesiovn_zalominidb"
APP_DB_USER="hotel_app_user"
APP_DB_PASS="HotelApp2025!@#Secure"

echo -e "${YELLOW}📋 MySQL Configuration:${NC}"
echo "   Existing MySQL User: $MYSQL_USER"
echo "   Database Name: $DB_NAME"
echo "   App User: $APP_DB_USER"
echo "   phpMyAdmin: https://157.10.199.22/phpmyadmin/"
echo ""

# Step 1: Test existing MySQL connection
echo -e "${BLUE}🔍 Step 1: Testing existing MySQL connection...${NC}"

mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS -e "SELECT VERSION();" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ MySQL connection successful${NC}"
else
    echo -e "${RED}❌ Cannot connect to MySQL with provided credentials${NC}"
    echo "Please verify your credentials:"
    echo "   Host: $MYSQL_HOST"
    echo "   Port: $MYSQL_PORT"
    echo "   User: $MYSQL_USER"
    echo "   Password: [Check if correct]"
    exit 1
fi

# Step 2: Create application database
echo -e "${BLUE}🗄️ Step 2: Creating application database...${NC}"

mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS << EOF
-- Create database for hotel management system
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Show databases to confirm
SHOW DATABASES LIKE '$DB_NAME';
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database '$DB_NAME' created successfully${NC}"
else
    echo -e "${RED}❌ Failed to create database${NC}"
    exit 1
fi

# Step 3: Create dedicated application user
echo -e "${BLUE}👤 Step 3: Creating dedicated application user...${NC}"

mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS << EOF
-- Create application user
CREATE USER IF NOT EXISTS '$APP_DB_USER'@'localhost' IDENTIFIED BY '$APP_DB_PASS';
CREATE USER IF NOT EXISTS '$APP_DB_USER'@'127.0.0.1' IDENTIFIED BY '$APP_DB_PASS';

-- Grant privileges on the hotel database only
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON $DB_NAME.* TO '$APP_DB_USER'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON $DB_NAME.* TO '$APP_DB_USER'@'127.0.0.1';

-- Apply changes
FLUSH PRIVILEGES;

-- Show the new user
SELECT User, Host FROM mysql.user WHERE User = '$APP_DB_USER';
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Application user '$APP_DB_USER' created successfully${NC}"
else
    echo -e "${RED}❌ Failed to create application user${NC}"
    exit 1
fi

# Step 4: Update FastAPI configuration
echo -e "${BLUE}⚙️ Step 4: Creating FastAPI database configuration...${NC}"

# URL encode the password for DATABASE_URL
# This handles special characters in passwords
python3 -c "
import urllib.parse
password = '$APP_DB_PASS'
encoded_password = urllib.parse.quote_plus(password)
print(f'Encoded password: {encoded_password}')
" > /tmp/encoded_pass.txt

ENCODED_APP_DB_PASS=$(python3 -c "import urllib.parse; print(urllib.parse.quote_plus('$APP_DB_PASS'))")

# Create environment configuration for your setup
cat > app/.env.production << EOF
# Production Database Configuration
DATABASE_URL=mysql+pymysql://$APP_DB_USER:$ENCODED_APP_DB_PASS@$MYSQL_HOST:$MYSQL_PORT/$DB_NAME

# Database Connection Settings (raw values for direct connections)
DB_HOST=$MYSQL_HOST
DB_PORT=$MYSQL_PORT
DB_USER=$APP_DB_USER
DB_PASSWORD=$APP_DB_PASS
DB_NAME=$DB_NAME

# Application Settings
APP_ENV=production
DEBUG=False
SECRET_KEY=your-secret-key-here-change-this-in-production

# Server Settings
HOST=127.0.0.1
PORT=8000

# CORS Settings
ALLOWED_ORIGINS=["https://bookingservices.io.vn", "https://www.bookingservices.io.vn"]
EOF

echo -e "${GREEN}✅ FastAPI configuration created in app/.env.production${NC}"

# Step 5: Create database connection test script
echo -e "${BLUE}🧪 Step 5: Creating database connection test...${NC}"

cat > test_db_connection.py << 'EOF'
#!/usr/bin/env python3
"""Test database connection for hotel management system"""

import os
import sys
import urllib.parse
from sqlalchemy import create_engine, text
import pymysql

# Add app directory to Python path
sys.path.append('/var/www/hotel-backend/backend/app')

def test_direct_connection():
    """Test direct database connection without .env file"""
    
    # Direct connection parameters
    host = "localhost"
    port = 3306
    user = "hotel_app_user"
    password = "HotelApp2025!@#Secure"
    database = "bookingservicesiovn_zalominidb"
    
    print(f"🔍 Testing direct connection to {user}@{host}:{port}/{database}")
    
    try:
        # Test with pymysql directly first
        connection = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            charset='utf8mb4'
        )
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"✅ PyMySQL direct connection successful!")
            print(f"   MySQL Version: {version[0]}")
            
            cursor.execute("SELECT DATABASE()")
            current_db = cursor.fetchone()
            print(f"   Current Database: {current_db[0]}")
            
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"   Tables in database: {len(tables)}")
            
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ Direct connection failed: {e}")
        return False

def test_sqlalchemy_connection():
    """Test SQLAlchemy connection"""
    
    # Load environment variables
    try:
        from dotenv import load_dotenv
        load_dotenv('app/.env.production')
    except ImportError:
        print("⚠️  python-dotenv not installed, using direct values")
    
    # Get connection parameters
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "3306")
    user = os.getenv("DB_USER", "hotel_app_user")
    password = os.getenv("DB_PASSWORD", "HotelApp2025!@#Secure")
    database = os.getenv("DB_NAME", "bookingservicesiovn_zalominidb")
    
    # URL encode password to handle special characters
    encoded_password = urllib.parse.quote_plus(password)
    database_url = f"mysql+pymysql://{user}:{encoded_password}@{host}:{port}/{database}"
    
    print(f"🔍 Testing SQLAlchemy connection...")
    print(f"   URL: mysql+pymysql://{user}:***@{host}:{port}/{database}")
    
    try:
        # Create engine
        engine = create_engine(database_url)
        
        # Test connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT VERSION() as version"))
            version = result.fetchone()
            print(f"✅ SQLAlchemy connection successful!")
            print(f"   MySQL Version: {version[0]}")
            
            # Test database exists
            result = connection.execute(text("SELECT DATABASE() as current_db"))
            current_db = result.fetchone()
            print(f"   Current Database: {current_db[0]}")
            
            # Test privileges
            result = connection.execute(text("SHOW TABLES"))
            tables = result.fetchall()
            print(f"   Tables in database: {len(tables)}")
            
        return True
        
    except Exception as e:
        print(f"❌ SQLAlchemy connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 DATABASE CONNECTION TEST")
    print("==========================")
    
    # Test 1: Direct PyMySQL connection
    print("\n📌 Test 1: Direct PyMySQL Connection")
    direct_success = test_direct_connection()
    
    # Test 2: SQLAlchemy connection
    print("\n📌 Test 2: SQLAlchemy Connection")
    sqlalchemy_success = test_sqlalchemy_connection()
    
    # Summary
    print(f"\n📋 RESULTS:")
    print(f"   Direct PyMySQL: {'✅ SUCCESS' if direct_success else '❌ FAILED'}")
    print(f"   SQLAlchemy: {'✅ SUCCESS' if sqlalchemy_success else '❌ FAILED'}")
    
    if direct_success and sqlalchemy_success:
        print("\n🎉 All database connection tests passed!")
        sys.exit(0)
    else:
        print("\n❌ Some database connection tests failed!")
        sys.exit(1)
EOF

chmod +x test_db_connection.py

echo -e "${GREEN}✅ Database test script created${NC}"

# Step 6: Test the connection
echo -e "${BLUE}🔬 Step 6: Testing database connection...${NC}"

cd /var/www/hotel-backend/backend
source venv/bin/activate 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Virtual environment not found, using system Python${NC}"
}

python test_db_connection.py

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database connection test passed!${NC}"
else
    echo -e "${RED}❌ Database connection test failed!${NC}"
    echo "Please check the configuration and try again."
    exit 1
fi

# Step 7: Import initial database schema
echo -e "${BLUE}📊 Step 7: Setting up database schema...${NC}"

if [ -f "ZaloMini App MySQL Script.sql" ]; then
    echo "Importing database schema..."
    mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $APP_DB_USER -p$APP_DB_PASS $DB_NAME < "ZaloMini App MySQL Script.sql"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database schema imported successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Schema import had issues, but continuing...${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Database schema file not found, skipping import${NC}"
    echo "You can import it later using phpMyAdmin at: https://157.10.199.22/phpmyadmin/"
fi

# Final summary
echo ""
echo -e "${GREEN}🎉 MySQL CONFIGURATION COMPLETED!${NC}"
echo ""
echo -e "${YELLOW}📋 Configuration Summary:${NC}"
echo "   ✅ Existing MySQL connection verified"
echo "   ✅ Database '$DB_NAME' created"
echo "   ✅ Application user '$APP_DB_USER' created"
echo "   ✅ FastAPI configuration updated"
echo "   ✅ Database connection tested"
echo ""
echo -e "${YELLOW}🔗 Access Information:${NC}"
echo "   • phpMyAdmin: https://157.10.199.22/phpmyadmin/"
echo "   • Admin User: da_admin"
echo "   • App Database: $DB_NAME"
echo "   • App User: $APP_DB_USER"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "   1. Review app/.env.production configuration"
echo "   2. Import your database schema via phpMyAdmin if needed"
echo "   3. Continue with deployment using: ./deploy_all.sh"
echo ""
echo -e "${GREEN}✨ Ready for FastAPI deployment!${NC}"
