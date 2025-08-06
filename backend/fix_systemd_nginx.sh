#!/bin/bash
# Fix Systemd & Nginx Issues - Final Solution
echo "🔧 FIXING SYSTEMD & NGINX ISSUES"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Step 1: Stop all services...${NC}"
sudo systemctl stop hotel-backend
sudo systemctl stop nginx

echo -e "${BLUE}🔧 Step 2: Kill any remaining processes...${NC}"
sudo pkill -f uvicorn 2>/dev/null || true
sudo pkill -f python3.11 2>/dev/null || true
sudo pkill -f fastapi 2>/dev/null || true

echo -e "${BLUE}🔧 Step 3: Reload systemd daemon...${NC}"
sudo systemctl daemon-reload

echo -e "${BLUE}🔧 Step 4: Check Nginx error logs...${NC}"
echo "Recent Nginx errors:"
sudo tail -20 /var/log/nginx/error.log 2>/dev/null || echo "No Nginx error logs found"

echo ""
echo -e "${BLUE}🔧 Step 5: Remove old Nginx configs completely...${NC}"
sudo rm -f /etc/nginx/sites-available/default
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/conf.d/default.conf
sudo rm -f /etc/nginx/conf.d/hotel-*.conf
sudo rm -f /etc/nginx/conf.d/bookingservices.conf

echo -e "${GREEN}✅ Old configs removed${NC}"

echo -e "${BLUE}🔧 Step 6: Create minimal Nginx config...${NC}"
sudo tee /etc/nginx/conf.d/api.conf > /dev/null << 'NGINXEOF'
# Simple API Proxy Configuration
server {
    listen 80;
    server_name 157.10.199.22 bookingservices.io.vn www.bookingservices.io.vn;
    
    # Root location - redirect to docs
    location = / {
        return 301 /docs;
    }
    
    # Proxy all requests to FastAPI
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Buffer settings
        proxy_buffering off;
        proxy_request_buffering off;
    }
    
    # Error pages
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
NGINXEOF

echo -e "${GREEN}✅ Minimal Nginx config created${NC}"

echo -e "${BLUE}🔧 Step 7: Test Nginx config...${NC}"
sudo nginx -t

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Nginx config test failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Nginx config is valid${NC}"

echo -e "${BLUE}🔧 Step 8: Start FastAPI service...${NC}"
sudo systemctl start hotel-backend
sleep 8

echo -e "${BLUE}🔧 Step 9: Check if FastAPI is running...${NC}"
echo "Service status:"
sudo systemctl status hotel-backend --no-pager -l | tail -10

echo ""
echo "Testing direct FastAPI connection:"
FASTAPI_TEST=$(curl -s http://127.0.0.1:8000/health 2>/dev/null)
if echo "$FASTAPI_TEST" | grep -q "healthy"; then
    echo -e "${GREEN}✅ FastAPI is running and healthy${NC}"
    echo "$FASTAPI_TEST" | head -3
else
    echo -e "${RED}❌ FastAPI is not responding${NC}"
    echo "FastAPI logs:"
    sudo journalctl -u hotel-backend -n 10 --no-pager
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Step 10: Start Nginx...${NC}"
sudo systemctl start nginx
sleep 3

echo "Nginx status:"
sudo systemctl status nginx --no-pager -l | tail -5

echo ""
echo -e "${BLUE}🔧 Step 11: Final comprehensive tests...${NC}"

echo "Test 1 - Direct FastAPI:"
curl -s http://127.0.0.1:8000/health | head -3
echo ""

echo "Test 2 - Through Nginx (health):"
NGINX_HEALTH=$(curl -s http://157.10.199.22/health 2>/dev/null)
if echo "$NGINX_HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Nginx proxy working!${NC}"
    echo "$NGINX_HEALTH" | head -3
else
    echo -e "${RED}❌ Nginx proxy still failing${NC}"
    echo "$NGINX_HEALTH" | head -5
fi

echo ""
echo "Test 3 - API docs:"
DOCS_TEST=$(curl -s http://157.10.199.22/docs 2>/dev/null | head -5)
if echo "$DOCS_TEST" | grep -q "swagger\|openapi\|docs"; then
    echo -e "${GREEN}✅ API docs accessible${NC}"
else
    echo -e "${YELLOW}⚠️  API docs may have issues${NC}"
fi

echo ""
echo "Test 4 - Root redirect:"
ROOT_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://157.10.199.22/ 2>/dev/null)
if [ "$ROOT_TEST" = "301" ] || [ "$ROOT_TEST" = "200" ]; then
    echo -e "${GREEN}✅ Root redirect working (HTTP $ROOT_TEST)${NC}"
else
    echo -e "${YELLOW}⚠️  Root redirect returned HTTP $ROOT_TEST${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Step 12: Check for any errors...${NC}"
echo "Recent Nginx errors after restart:"
sudo tail -10 /var/log/nginx/error.log 2>/dev/null | grep -v "warn" || echo "No new errors"

echo ""
if curl -s http://157.10.199.22/health | grep -q "healthy"; then
    echo -e "${GREEN}🎉 SUCCESS! ALL SERVICES WORKING!${NC}"
    echo ""
    echo -e "${YELLOW}🔗 Access Points:${NC}"
    echo "   • API Health: http://157.10.199.22/health"
    echo "   • API Docs: http://157.10.199.22/docs"
    echo "   • API Root: http://157.10.199.22/"
    echo "   • phpMyAdmin: https://157.10.199.22/phpmyadmin/"
    echo ""
    echo -e "${YELLOW}🔧 Management Commands:${NC}"
    echo "   • Check FastAPI: sudo systemctl status hotel-backend"
    echo "   • Check Nginx: sudo systemctl status nginx"
    echo "   • View FastAPI logs: sudo journalctl -u hotel-backend -f"
    echo "   • View Nginx logs: sudo tail -f /var/log/nginx/error.log"
    echo ""
    echo -e "${GREEN}✨ Your Hotel Management System is LIVE!${NC}"
else
    echo -e "${RED}❌ Still having issues${NC}"
    echo ""
    echo -e "${YELLOW}🔍 Debug steps:${NC}"
    echo "1. Check FastAPI logs: sudo journalctl -u hotel-backend -f"
    echo "2. Check Nginx logs: sudo tail -f /var/log/nginx/error.log"
    echo "3. Test direct FastAPI: curl http://127.0.0.1:8000/health"
    echo "4. Check processes: ps aux | grep -E '(uvicorn|nginx)'"
    echo ""
    echo -e "${BLUE}📋 Current Status:${NC}"
    echo "FastAPI: $(systemctl is-active hotel-backend)"
    echo "Nginx: $(systemctl is-active nginx)"
fi
