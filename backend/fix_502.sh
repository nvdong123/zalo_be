#!/bin/bash
# Quick Fix for 502 Bad Gateway
# This script attempts to fix common 502 issues

echo "🔧 QUICK FIX FOR 502 BAD GATEWAY"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Step 1: Stopping all services...${NC}"
sudo systemctl stop hotel-backend 2>/dev/null
sudo systemctl stop nginx 2>/dev/null

echo -e "${BLUE}🔧 Step 2: Checking if FastAPI can start manually...${NC}"
cd /var/www/hotel-backend/backend

# Check if directory exists
if [ ! -d "/var/www/hotel-backend/backend" ]; then
    echo -e "${RED}❌ Backend directory not found!${NC}"
    echo "Please ensure the project is deployed to /var/www/hotel-backend/backend"
    exit 1
fi

# Check virtual environment
if [ ! -f "venv/bin/activate" ]; then
    echo -e "${RED}❌ Virtual environment not found!${NC}"
    echo "Creating new virtual environment..."
    /usr/local/bin/python3.11 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r app/requirements_almalinux.txt
else
    source venv/bin/activate
fi

# Test import of main modules
echo -e "${BLUE}🔧 Step 3: Testing Python imports...${NC}"
python -c "
try:
    import fastapi, uvicorn, sqlalchemy, pymysql
    print('✅ Core dependencies imported successfully')
except ImportError as e:
    print(f'❌ Import error: {e}')
    exit(1)
"

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Dependencies missing, reinstalling...${NC}"
    pip install --upgrade pip
    pip install -r app/requirements_almalinux.txt
fi

# Test if main app can be imported
echo -e "${BLUE}🔧 Step 4: Testing FastAPI app import...${NC}"
python -c "
import sys
sys.path.append('/var/www/hotel-backend/backend')
try:
    from app.main_production import app
    print('✅ FastAPI app imported successfully')
except Exception as e:
    print(f'❌ FastAPI app import error: {e}')
    # Try the regular main instead
    try:
        from app.main import app
        print('✅ Regular FastAPI app imported successfully')
    except Exception as e2:
        print(f'❌ Both app imports failed: {e2}')
        exit(1)
"

# Create a simple test app if the main app fails
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Creating simple test app...${NC}"
    cat > app/test_app.py << 'EOF'
from fastapi import FastAPI

app = FastAPI(
    title="Hotel Management System - Test",
    description="Simple test app to verify deployment",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "Test app is working"}

@app.get("/health")
async def health():
    return {"status": "healthy", "app": "test"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
EOF
fi

echo -e "${BLUE}🔧 Step 5: Testing database connection...${NC}"
if [ -f "test_db_connection.py" ]; then
    python test_db_connection.py || echo "⚠️  Database connection issues"
fi

echo -e "${BLUE}🔧 Step 6: Starting FastAPI manually (test)...${NC}"
timeout 10 python -c "
import uvicorn
import sys
sys.path.append('/var/www/hotel-backend/backend')

try:
    from app.main_production import app
    print('Using production app')
except:
    try:
        from app.main import app
        print('Using regular app')
    except:
        from app.test_app import app
        print('Using test app')

uvicorn.run(app, host='127.0.0.1', port=8000, log_level='info')
" &

# Wait and test
sleep 5
curl -s http://127.0.0.1:8000/health && echo -e "\n✅ FastAPI responding" || echo -e "\n❌ FastAPI not responding"

# Kill the test process
pkill -f "uvicorn"

echo -e "${BLUE}🔧 Step 7: Updating systemd service...${NC}"
sudo tee /etc/systemd/system/hotel-backend.service > /dev/null << 'EOF'
[Unit]
Description=Hotel Management Backend API
After=network.target

[Service]
Type=exec
User=root
Group=root
WorkingDirectory=/var/www/hotel-backend/backend
Environment=PATH=/var/www/hotel-backend/backend/venv/bin:/usr/local/bin
Environment=PYTHONPATH=/var/www/hotel-backend/backend
Environment=APP_ENV=production
ExecStartPre=/bin/sleep 5
ExecStart=/var/www/hotel-backend/backend/venv/bin/uvicorn app.main_production:app --host 127.0.0.1 --port 8000 --workers 1

Restart=always
RestartSec=10

StandardOutput=journal
StandardError=journal
SyslogIdentifier=hotel-backend

[Install]
WantedBy=multi-user.target
EOF

echo -e "${BLUE}🔧 Step 8: Reloading and starting services...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable hotel-backend
sudo systemctl start hotel-backend

# Wait for service to start
sleep 10

echo -e "${BLUE}🔧 Step 9: Checking service status...${NC}"
sudo systemctl status hotel-backend --no-pager -l

echo -e "${BLUE}🔧 Step 10: Testing local API...${NC}"
curl -s http://127.0.0.1:8000/health && echo -e "\n✅ Local API working" || echo -e "\n❌ Local API still not working"

echo -e "${BLUE}🔧 Step 11: Starting Nginx...${NC}"
sudo systemctl start nginx
sudo systemctl status nginx --no-pager -l

echo -e "${BLUE}🔧 Step 12: Final test...${NC}"
curl -s http://localhost/api/health && echo -e "\n✅ Nginx proxy working" || echo -e "\n❌ Nginx proxy still has issues"

echo ""
echo -e "${GREEN}🎉 QUICK FIX COMPLETED!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps if still having issues:${NC}"
echo "1. Check logs: sudo journalctl -u hotel-backend -f"
echo "2. Test manually: cd /var/www/hotel-backend/backend && source venv/bin/activate && python app/main_production.py"
echo "3. Check Nginx config: sudo nginx -t"
echo "4. Try simple test app: Change systemd service to use app.test_app:app"
echo ""
echo -e "${BLUE}🔗 Try accessing:${NC}"
echo "• http://157.10.199.22/api/health"
echo "• https://157.10.199.22/api/docs"
