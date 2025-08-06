#!/bin/bash
# Test VPS Database Connection with Real Credentials
echo "🔍 TESTING VPS DATABASE CONNECTION"
echo "================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Your VPS credentials
VPS_MYSQL_USER="da_admin"
VPS_MYSQL_PASS="C8tZ5WfPAxAPfBso"
VPS_MYSQL_HOST="localhost"
VPS_MYSQL_PORT="3306"
VPS_DB_NAME="bookingservicesiovn_zalominidb"

echo -e "${YELLOW}📋 VPS Database Credentials:${NC}"
echo "   Host: $VPS_MYSQL_HOST"
echo "   Port: $VPS_MYSQL_PORT"
echo "   User: $VPS_MYSQL_USER"
echo "   Database: $VPS_DB_NAME"
echo "   phpMyAdmin: https://157.10.199.22/phpmyadmin/"
echo ""

echo -e "${BLUE}🔍 Step 1: Testing MySQL connection...${NC}"
mysql -h $VPS_MYSQL_HOST -P $VPS_MYSQL_PORT -u $VPS_MYSQL_USER -p$VPS_MYSQL_PASS -e "SELECT 'Connection successful!' as status, VERSION() as mysql_version;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ VPS MySQL connection successful${NC}"
else
    echo -e "${RED}❌ VPS MySQL connection failed${NC}"
    echo "Please check if MySQL service is running: sudo systemctl status mysqld"
    exit 1
fi

echo ""
echo -e "${BLUE}🔍 Step 2: Checking if hotel database exists...${NC}"
DB_EXISTS=$(mysql -h $VPS_MYSQL_HOST -P $VPS_MYSQL_PORT -u $VPS_MYSQL_USER -p$VPS_MYSQL_PASS -e "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$VPS_DB_NAME';" 2>/dev/null | grep -v SCHEMA_NAME)

if [ -n "$DB_EXISTS" ]; then
    echo -e "${GREEN}✅ Hotel database exists${NC}"
    
    # Check tables in database
    echo ""
    echo -e "${BLUE}🔍 Tables in database:${NC}"
    mysql -h $VPS_MYSQL_HOST -P $VPS_MYSQL_PORT -u $VPS_MYSQL_USER -p$VPS_MYSQL_PASS -e "USE $VPS_DB_NAME; SHOW TABLES;" 2>/dev/null
else
    echo -e "${YELLOW}⚠️  Hotel database does not exist, creating it...${NC}"
    mysql -h $VPS_MYSQL_HOST -P $VPS_MYSQL_PORT -u $VPS_MYSQL_USER -p$VPS_MYSQL_PASS -e "CREATE DATABASE IF NOT EXISTS $VPS_DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Hotel database created successfully${NC}"
    else
        echo -e "${RED}❌ Failed to create hotel database${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}🔧 Step 3: Testing Python connection...${NC}"
cd /var/www/hotel-backend/backend
source venv/bin/activate

python -c "
import pymysql
import sys

try:
    connection = pymysql.connect(
        host='$VPS_MYSQL_HOST',
        port=$VPS_MYSQL_PORT,
        user='$VPS_MYSQL_USER',
        password='$VPS_MYSQL_PASS',
        database='$VPS_DB_NAME',
        charset='utf8mb4'
    )
    
    with connection.cursor() as cursor:
        cursor.execute('SELECT VERSION()')
        version = cursor.fetchone()
        print(f'✅ Python MySQL connection successful!')
        print(f'   MySQL Version: {version[0]}')
        
        cursor.execute('SELECT DATABASE()')
        current_db = cursor.fetchone()
        print(f'   Current Database: {current_db[0]}')
        
        cursor.execute('SHOW TABLES')
        tables = cursor.fetchall()
        print(f'   Tables in database: {len(tables)}')
        
    connection.close()
    print('✅ Python connection test passed!')
    
except Exception as e:
    print(f'❌ Python connection failed: {e}')
    sys.exit(1)
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All database tests passed!${NC}"
    echo ""
    echo -e "${YELLOW}🎯 Ready to deploy with VPS database!${NC}"
    echo ""
    echo -e "${BLUE}💡 Next steps:${NC}"
    echo "1. Run: ./final_fix.sh"
    echo "2. Test: curl http://157.10.199.22/health"
    echo "3. Access: http://157.10.199.22/docs"
else
    echo -e "${RED}❌ Database tests failed!${NC}"
    echo "Please check your MySQL setup."
fi
