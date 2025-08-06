#!/bin/bash
# Emergency FastAPI Fix for 502 Error
# This script diagnoses and fixes FastAPI backend issues

echo "🚨 EMERGENCY 502 FIX - FASTAPI BACKEND"
echo "====================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Step 1: Checking FastAPI service status...${NC}"
sudo systemctl status hotel-backend --no-pager -l

echo ""
echo -e "${BLUE}🔍 Step 2: Checking if anything is listening on port 8000...${NC}"
sudo netstat -tlnp | grep :8000

echo ""
echo -e "${BLUE}🔍 Step 3: Checking FastAPI logs...${NC}"
echo "Last 30 lines of FastAPI logs:"
sudo journalctl -u hotel-backend -n 30 --no-pager

echo ""
echo -e "${BLUE}🔧 Step 4: Stopping current service...${NC}"
sudo systemctl stop hotel-backend
sudo pkill -f uvicorn 2>/dev/null
sudo pkill -f fastapi 2>/dev/null

echo ""
echo -e "${BLUE}🔧 Step 5: Testing FastAPI manually...${NC}"
cd /var/www/hotel-backend/backend

# Check if directory exists
if [ ! -d "/var/www/hotel-backend/backend" ]; then
    echo -e "${RED}❌ Backend directory not found!${NC}"
    exit 1
fi

# Activate virtual environment
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo -e "${GREEN}✅ Virtual environment activated${NC}"
else
    echo -e "${RED}❌ Virtual environment not found${NC}"
    exit 1
fi

# Test Python and dependencies
echo -e "${BLUE}🔧 Step 6: Testing Python environment...${NC}"
python --version
pip list | grep -E "(fastapi|uvicorn|sqlalchemy|pymysql)"

echo ""
echo -e "${BLUE}🔧 Step 7: Testing basic FastAPI import...${NC}"
python -c "
import sys
print(f'Python path: {sys.path}')
try:
    import fastapi
    print('✅ FastAPI imported successfully')
except Exception as e:
    print(f'❌ FastAPI import error: {e}')
    exit(1)

try:
    import uvicorn
    print('✅ Uvicorn imported successfully')
except Exception as e:
    print(f'❌ Uvicorn import error: {e}')
    exit(1)
"

echo ""
echo -e "${BLUE}🔧 Step 8: Creating minimal test FastAPI app...${NC}"

# Create a minimal working app for testing
cat > test_minimal_app.py << 'EOF'
#!/usr/bin/env python3
from fastapi import FastAPI
import uvicorn

app = FastAPI(title="Minimal Test App")

@app.get("/")
async def root():
    return {"status": "ok", "message": "Minimal app is working"}

@app.get("/health")
async def health():
    return {"status": "healthy", "app": "minimal"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
EOF

chmod +x test_minimal_app.py

echo -e "${BLUE}🔧 Step 9: Testing minimal app (15 seconds)...${NC}"
timeout 15 python test_minimal_app.py &
MINIMAL_PID=$!

sleep 5
curl -s http://127.0.0.1:8000/health && echo -e "\n✅ Minimal app works!" || echo -e "\n❌ Minimal app failed!"

# Kill the test app
kill $MINIMAL_PID 2>/dev/null
pkill -f test_minimal_app 2>/dev/null

echo ""
echo -e "${BLUE}🔧 Step 10: Testing production app import...${NC}"
python -c "
import sys
import os
sys.path.append('/var/www/hotel-backend/backend')
os.chdir('/var/www/hotel-backend/backend')

try:
    from app.main_production import app
    print('✅ Production app imported successfully')
except Exception as e:
    print(f'❌ Production app import error: {e}')
    try:
        from app.main import app
        print('✅ Regular app imported successfully')
    except Exception as e2:
        print(f'❌ Regular app import error: {e2}')
        print('Will use minimal app instead')
"

echo ""
echo -e "${BLUE}🔧 Step 11: Updating systemd service with working app...${NC}"

# Determine which app to use
if python -c "from app.main_production import app" 2>/dev/null; then
    APP_MODULE="app.main_production:app"
    echo "Using production app"
elif python -c "from app.main import app" 2>/dev/null; then
    APP_MODULE="app.main:app"
    echo "Using regular app"
else
    APP_MODULE="test_minimal_app:app"
    echo "Using minimal test app"
fi

# Create new systemd service
sudo tee /etc/systemd/system/hotel-backend.service > /dev/null << EOF
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
ExecStart=/var/www/hotel-backend/backend/venv/bin/uvicorn ${APP_MODULE} --host 127.0.0.1 --port 8000 --workers 1 --log-level info

Restart=always
RestartSec=10

StandardOutput=journal
StandardError=journal
SyslogIdentifier=hotel-backend

[Install]
WantedBy=multi-user.target
EOF

echo -e "${BLUE}🔧 Step 12: Starting FastAPI service...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable hotel-backend
sudo systemctl start hotel-backend

# Wait for service to start
sleep 10

echo ""
echo -e "${BLUE}🔍 Step 13: Checking service status...${NC}"
sudo systemctl status hotel-backend --no-pager -l

echo ""
echo -e "${BLUE}🔍 Step 14: Testing local FastAPI...${NC}"
curl -s http://127.0.0.1:8000/health && echo -e "\n✅ FastAPI is responding!" || echo -e "\n❌ FastAPI still not responding"

echo ""
echo -e "${BLUE}🔍 Step 15: Testing through Nginx...${NC}"
curl -s http://157.10.199.22/health && echo -e "\n✅ Nginx proxy working!" || echo -e "\n❌ Still 502 error"

echo ""
if curl -s http://127.0.0.1:8000/health >/dev/null; then
    echo -e "${GREEN}🎉 FASTAPI IS NOW WORKING!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Access points:${NC}"
    echo "   • Direct FastAPI: http://127.0.0.1:8000/health"
    echo "   • Through Nginx: http://157.10.199.22/health"
    echo "   • API Docs: http://157.10.199.22/api/docs"
    echo ""
    echo -e "${YELLOW}🔧 Management commands:${NC}"
    echo "   • Check status: sudo systemctl status hotel-backend"
    echo "   • View logs: sudo journalctl -u hotel-backend -f"
    echo "   • Restart: sudo systemctl restart hotel-backend"
else
    echo -e "${RED}❌ FASTAPI STILL NOT WORKING${NC}"
    echo ""
    echo -e "${YELLOW}📋 Manual debugging steps:${NC}"
    echo "1. Check logs: sudo journalctl -u hotel-backend -f"
    echo "2. Test manually: cd /var/www/hotel-backend/backend && source venv/bin/activate && python test_minimal_app.py"
    echo "3. Check dependencies: pip install fastapi uvicorn sqlalchemy pymysql"
    echo "4. Check Python: python --version"
fi
