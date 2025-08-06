#!/bin/bash
# Upgrade Python to Latest Version on VPS
# This script will install Python 3.11 and update the project

echo "🐍 Upgrading Python to Latest Version on VPS"
echo "============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check current Python version
echo -e "${BLUE}📋 Current Python version:${NC}"
python3 --version
python --version

echo -e "${YELLOW}🔄 Starting Python upgrade process...${NC}"

# Step 1: Update system packages
echo -e "${BLUE}📦 Step 1: Updating system packages...${NC}"
sudo dnf update -y

# Step 2: Install dependencies for building Python
echo -e "${BLUE}📦 Step 2: Installing build dependencies...${NC}"
sudo dnf config-manager --set-enabled powertools
sudo dnf install -y epel-release
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y \
    zlib-devel \
    bzip2-devel \
    openssl-devel \
    ncurses-devel \
    sqlite-devel \
    readline-devel \
    tk-devel \
    libffi-devel \
    xz-devel \
    wget \
    gcc \
    make

# Step 3: Install Python 3.11 from source
echo -e "${BLUE}🐍 Step 3: Installing Python 3.11 from source...${NC}"
cd /tmp
wget https://www.python.org/ftp/python/3.11.7/Python-3.11.7.tgz
tar xzf Python-3.11.7.tgz
cd Python-3.11.7
./configure --enable-optimizations --with-ensurepip=install --prefix=/usr/local
make -j$(nproc)
sudo make altinstall

# Step 4: Create symlinks
echo -e "${BLUE}🔧 Step 4: Setting up Python 3.11...${NC}"
sudo ln -sf /usr/local/bin/python3.11 /usr/local/bin/python3
sudo ln -sf /usr/local/bin/pip3.11 /usr/local/bin/pip3

# Step 5: Verify installation
echo -e "${BLUE}✅ Step 5: Verifying Python installation...${NC}"
/usr/local/bin/python3.11 --version
/usr/local/bin/pip3.11 --version

# Step 6: Backup current project
echo -e "${BLUE}💾 Step 8: Backing up current project...${NC}"
cd /var/www/hotel-backend/
sudo cp -r backend backend_backup_$(date +%Y%m%d_%H%M%S)

# Step 7: Recreate virtual environment with Python 3.11
echo -e "${BLUE}🔄 Step 7: Recreating virtual environment...${NC}"
cd /var/www/hotel-backend/backend

# Remove old venv
sudo rm -rf venv

# Create new venv with Python 3.11
/usr/local/bin/python3.11 -m venv venv
source venv/bin/activate

# Upgrade pip in new venv
pip install --upgrade pip setuptools wheel

echo -e "${GREEN}✅ Python 3.11 installation completed!${NC}"

# Step 10: Update requirements.txt to latest versions
echo -e "${BLUE}📝 Step 10: Updating requirements.txt to latest versions...${NC}"

cat > app/requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pydantic==2.10.1
pydantic-settings==2.6.1
alembic==1.12.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
python-dotenv==1.0.0
pytest==7.4.3
typer==0.9.0
emails==0.6
aiofiles==23.2.1
boto3==1.26.137
httpx==0.28.1
Pillow==10.1.0
fastapi-mail==1.4.1
sqlmodel==0.0.14
pymysql==1.1.0
pydantic-core==2.27.1
bcrypt==4.0.1

# Production middleware and monitoring dependencies
psutil>=5.9.0           # System monitoring
cryptography>=41.0.0   # Enhanced security
redis>=5.0.0           # Caching and rate limiting
structlog>=23.0.0      # Structured logging
prometheus-client>=0.19.0  # Metrics collection
sentry-sdk[fastapi]>=1.40.0  # Error tracking
gunicorn>=21.0.0       # WSGI server
EOF

echo -e "${GREEN}✅ Requirements.txt updated with latest versions!${NC}"

# Step 11: Install latest dependencies
echo -e "${BLUE}📦 Step 11: Installing latest dependencies...${NC}"
pip install -r app/requirements.txt

# Step 12: Test imports
echo -e "${BLUE}🧪 Step 12: Testing module imports...${NC}"
python -c "
import sys
print(f'Python version: {sys.version}')

try:
    import fastapi
    import uvicorn
    import sqlalchemy
    import pydantic
    import pymysql
    print('✅ All core modules imported successfully!')
    print(f'FastAPI version: {fastapi.__version__}')
    print(f'SQLAlchemy version: {sqlalchemy.__version__}')
    print(f'Pydantic version: {pydantic.VERSION}')
except ImportError as e:
    print(f'❌ Import error: {e}')
    exit(1)
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 All dependencies working with Python 3.11!${NC}"
else
    echo -e "${RED}❌ Some dependencies have issues${NC}"
    exit 1
fi

# Step 13: Update systemd service to use new Python
echo -e "${BLUE}🔧 Step 13: Updating systemd service...${NC}"
sudo systemctl stop hotel-backend

# Update service file
sudo tee /etc/systemd/system/hotel-backend.service > /dev/null << 'EOF'
[Unit]
Description=Hotel Management Backend API
Documentation=https://github.com/nvdong123/zalo_be
After=network.target mysql.service
Wants=mysql.service

[Service]
Type=exec
User=hotelapp
Group=hotelapp
WorkingDirectory=/var/www/hotel-backend/backend
Environment=PATH=/var/www/hotel-backend/backend/venv/bin
Environment=PYTHONPATH=/var/www/hotel-backend/backend
ExecStart=/var/www/hotel-backend/backend/venv/bin/uvicorn \
    app.main:app \
    --host 127.0.0.1 \
    --port 8000 \
    --workers 4 \
    --timeout-keep-alive 120 \
    --access-log \
    --log-level info

Restart=always
RestartSec=10
KillMode=mixed
TimeoutStopSec=30

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=hotel-backend

# Security settings
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/var/www/uploads /var/log/hotel-backend /var/www/hotel-backend/backend/logs
CapabilityBoundingSet=CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_BIND_SERVICE

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
EOF

# Step 14: Reload and restart services
echo -e "${BLUE}🔄 Step 14: Reloading services...${NC}"
sudo systemctl daemon-reload
sudo systemctl start hotel-backend
sudo systemctl status hotel-backend

echo ""
echo -e "${GREEN}🎉 PYTHON UPGRADE COMPLETED!${NC}"
echo ""
echo -e "${YELLOW}📋 Summary:${NC}"
echo "   • Python upgraded to 3.11"
echo "   • Virtual environment recreated"
echo "   • Latest package versions installed"
echo "   • Systemd service updated"
echo "   • Service restarted"
echo ""
echo -e "${YELLOW}🔧 Check status:${NC}"
echo "   • Python version: $(python3 --version)"
echo "   • Service status: sudo systemctl status hotel-backend"
echo "   • Test API: curl http://127.0.0.1:8000/docs"
echo ""
echo -e "${GREEN}✨ Your VPS now runs the latest Python and packages!${NC}"
