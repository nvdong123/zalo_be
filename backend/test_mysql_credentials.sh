#!/bin/bash
# Quick MySQL Credentials Test
# Tests if the provided MySQL credentials work

echo "🔍 MYSQL CREDENTIALS TEST"
echo "========================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Your provided credentials
MYSQL_USER="da_admin"
MYSQL_PASS="C8tZ5WfPAxAPfBso"
MYSQL_HOST="localhost"
MYSQL_PORT="3306"

echo -e "${YELLOW}📋 Testing credentials:${NC}"
echo "   Host: $MYSQL_HOST"
echo "   Port: $MYSQL_PORT"
echo "   User: $MYSQL_USER"
echo "   Password: [HIDDEN]"
echo ""

# Test 1: Basic connection
echo -e "${BLUE}🔍 Test 1: Basic MySQL connection...${NC}"

mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS -e "SELECT 'Connection successful!' as status, VERSION() as mysql_version;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Basic connection successful${NC}"
else
    echo -e "${RED}❌ Basic connection failed${NC}"
    echo "Please verify:"
    echo "   1. MySQL service is running: sudo systemctl status mysqld"
    echo "   2. User credentials are correct"
    echo "   3. User has login privileges"
    exit 1
fi

# Test 2: Check user privileges
echo -e "${BLUE}🔍 Test 2: Checking user privileges...${NC}"

mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS -e "SHOW GRANTS FOR CURRENT_USER();" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ User privileges checked${NC}"
else
    echo -e "${YELLOW}⚠️  Could not check privileges${NC}"
fi

# Test 3: Check existing databases
echo -e "${BLUE}🔍 Test 3: Listing existing databases...${NC}"

mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS -e "SHOW DATABASES;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database listing successful${NC}"
else
    echo -e "${RED}❌ Cannot list databases${NC}"
fi

# Test 4: Check if hotel database exists
echo -e "${BLUE}🔍 Test 4: Checking for hotel database...${NC}"

DB_EXISTS=$(mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS -e "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'bookingservicesiovn_zalominidb';" 2>/dev/null | grep -v SCHEMA_NAME)

if [ -n "$DB_EXISTS" ]; then
    echo -e "${GREEN}✅ Hotel database already exists${NC}"
else
    echo -e "${YELLOW}⚠️  Hotel database does not exist (will be created)${NC}"
fi

# Test 5: Test database creation permission
echo -e "${BLUE}🔍 Test 5: Testing database creation permission...${NC}"

mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS -e "CREATE DATABASE IF NOT EXISTS test_permission_check; DROP DATABASE IF EXISTS test_permission_check;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database creation permission confirmed${NC}"
else
    echo -e "${YELLOW}⚠️  Limited database creation permissions${NC}"
fi

echo ""
echo -e "${GREEN}🎉 CREDENTIALS TEST COMPLETED!${NC}"
echo ""
echo -e "${YELLOW}📋 Summary:${NC}"
echo "   ✅ MySQL credentials are valid"
echo "   ✅ Connection to MySQL server successful"
echo "   ✅ Ready to proceed with hotel database setup"
echo ""
echo -e "${BLUE}💡 Next step: Run ./configure_existing_mysql.sh${NC}"
