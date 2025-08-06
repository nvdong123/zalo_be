#!/bin/bash
# Debug 502 Bad Gateway Error
# Run this script to diagnose the 502 error

echo "🔍 DEBUGGING 502 BAD GATEWAY ERROR"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📊 Step 1: Checking FastAPI service status...${NC}"
sudo systemctl status hotel-backend --no-pager -l

echo ""
echo -e "${BLUE}📊 Step 2: Checking if FastAPI is listening on port 8000...${NC}"
sudo netstat -tlnp | grep :8000 || echo "❌ Nothing listening on port 8000"

echo ""
echo -e "${BLUE}📊 Step 3: Checking Nginx status...${NC}"
sudo systemctl status nginx --no-pager -l

echo ""
echo -e "${BLUE}📊 Step 4: Testing local FastAPI connection...${NC}"
curl -s http://127.0.0.1:8000/health 2>/dev/null && echo "✅ FastAPI responding locally" || echo "❌ FastAPI not responding locally"

echo ""
echo -e "${BLUE}📊 Step 5: Checking FastAPI logs (last 20 lines)...${NC}"
sudo journalctl -u hotel-backend -n 20 --no-pager

echo ""
echo -e "${BLUE}📊 Step 6: Checking Nginx error logs...${NC}"
sudo tail -n 10 /var/log/nginx/error.log 2>/dev/null || echo "No Nginx error logs found"

echo ""
echo -e "${BLUE}📊 Step 7: Testing Nginx configuration...${NC}"
sudo nginx -t

echo ""
echo -e "${BLUE}📊 Step 8: Checking if virtual environment is working...${NC}"
cd /var/www/hotel-backend/backend
ls -la venv/bin/python* 2>/dev/null || echo "❌ Virtual environment not found"

echo ""
echo -e "${BLUE}📊 Step 9: Checking Python and dependencies...${NC}"
/var/www/hotel-backend/backend/venv/bin/python --version 2>/dev/null || echo "❌ Python not working in venv"

echo ""
echo -e "${BLUE}💡 Step 10: Quick fixes to try:${NC}"
echo "1. Restart FastAPI service: sudo systemctl restart hotel-backend"
echo "2. Restart Nginx: sudo systemctl restart nginx"
echo "3. Check if app can start manually: cd /var/www/hotel-backend/backend && source venv/bin/activate && python app/main_production.py"
echo "4. View real-time logs: sudo journalctl -u hotel-backend -f"

echo ""
echo -e "${YELLOW}🔧 Common causes of 502 errors:${NC}"
echo "• FastAPI service not running"
echo "• FastAPI crashed due to import errors"
echo "• Database connection issues"
echo "• Virtual environment problems"
echo "• Nginx proxy configuration issues"
