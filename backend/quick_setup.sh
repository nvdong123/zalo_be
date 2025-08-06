#!/bin/bash
# Quick Setup with Existing MySQL Credentials
# Run this script to configure your hotel management system

echo "🚀 QUICK SETUP WITH EXISTING MYSQL"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}📋 Your VPS Configuration:${NC}"
echo "   VPS IP: 157.10.199.22"
echo "   SSH Port: 2222"
echo "   Domain: bookingservices.io.vn"
echo "   phpMyAdmin: https://157.10.199.22/phpmyadmin/"
echo "   MySQL User: da_admin"
echo ""

# Make scripts executable
chmod +x configure_existing_mysql.sh
chmod +x deploy_all.sh

echo -e "${BLUE}🔧 Step 1: Configure MySQL for hotel management...${NC}"
./configure_existing_mysql.sh

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ MySQL configuration completed!${NC}"
    
    echo -e "${BLUE}🚀 Step 2: Run full deployment...${NC}"
    echo "Do you want to continue with full deployment? (y/n)"
    read -r response
    
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        ./deploy_all.sh
    else
        echo -e "${YELLOW}⏸️  Deployment paused. You can run it later with: ./deploy_all.sh${NC}"
    fi
else
    echo -e "${RED}❌ MySQL configuration failed!${NC}"
    echo "Please check your MySQL credentials and try again."
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 SETUP COMPLETED!${NC}"
echo ""
echo -e "${YELLOW}🔗 Quick Access:${NC}"
echo "   • phpMyAdmin: https://157.10.199.22/phpmyadmin/"
echo "   • API Docs: https://bookingservices.io.vn/api/docs"
echo "   • Health Check: https://bookingservices.io.vn/health"
echo ""
echo -e "${YELLOW}🔧 Management Commands:${NC}"
echo "   • Check service: sudo systemctl status hotel-backend"
echo "   • View logs: sudo journalctl -u hotel-backend -f"
echo "   • Test database: python test_db_connection.py"
echo ""
