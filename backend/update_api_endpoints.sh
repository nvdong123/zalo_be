#!/bin/bash
# Update main_production.py with full API endpoints
echo "🔄 UPDATING API ENDPOINTS"
echo "========================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📦 Backing up current file...${NC}"
sudo cp /root/hotel-backend/app/main_production.py /root/hotel-backend/app/main_production.py.backup

echo -e "${YELLOW}📤 Uploading new main_production.py...${NC}"
# File will be uploaded separately

echo -e "${YELLOW}🔄 Restarting hotel-backend service...${NC}"
sudo systemctl stop hotel-backend
sleep 3
sudo systemctl start hotel-backend

echo -e "${YELLOW}⏳ Waiting for service to start...${NC}"
sleep 5

echo -e "${YELLOW}🧪 Testing service...${NC}"
SERVICE_STATUS=$(sudo systemctl is-active hotel-backend)
echo "Service status: $SERVICE_STATUS"

if [ "$SERVICE_STATUS" = "active" ]; then
    echo -e "${YELLOW}🧪 Testing API endpoints...${NC}"
    sleep 3
    
    # Test health endpoint
    HEALTH_TEST=$(curl -s http://127.0.0.1:8000/health)
    echo "Health: $HEALTH_TEST"
    
    # Test root endpoint
    ROOT_TEST=$(curl -s http://127.0.0.1:8000/)
    echo "Root: $ROOT_TEST"
    
    # Test API endpoint
    API_TEST=$(curl -s http://127.0.0.1:8000/api/v1/rooms)
    echo "API rooms: $API_TEST"
    
    echo -e "${GREEN}"
    echo "🎉 SERVICE UPDATED!"
    echo "=================="
    echo "✅ Check your Swagger UI: http://nevascore.id.vn/docs"
    echo "✅ All API endpoints should now be visible!"
    echo -e "${NC}"
    
else
    echo -e "${RED}❌ Service failed to start${NC}"
    echo "Checking logs:"
    sudo journalctl -u hotel-backend -n 10 --no-pager
    echo ""
    echo "Restoring backup:"
    sudo cp /root/hotel-backend/app/main_production.py.backup /root/hotel-backend/app/main_production.py
    sudo systemctl start hotel-backend
fi
