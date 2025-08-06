#!/bin/bash
# Fix Python Dependencies Installation
# Run this on VPS to properly install all dependencies

echo "🔧 Installing Python Dependencies - FIXED VERSION"
echo "==============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Navigate to project directory
cd /var/www/hotel-backend/backend

echo -e "${BLUE}📦 Step 1: Upgrading pip and setuptools...${NC}"
source venv/bin/activate
pip install --upgrade pip setuptools wheel

echo -e "${BLUE}📦 Step 2: Installing core dependencies first...${NC}"
pip install fastapi==0.104.1
pip install uvicorn[standard]==0.24.0
pip install sqlalchemy==2.0.23
pip install pydantic==2.10.1
pip install pydantic-settings==2.6.1

echo -e "${BLUE}📦 Step 3: Installing database dependencies...${NC}"
pip install alembic==1.12.1
pip install sqlmodel==0.0.14
pip install pymysql==1.1.0

echo -e "${BLUE}📦 Step 4: Installing security dependencies...${NC}"
pip install python-jose[cryptography]==3.3.0
pip install passlib[bcrypt]==1.7.4
pip install bcrypt==4.0.1
pip install cryptography>=3.4.8

echo -e "${BLUE}📦 Step 5: Installing utility dependencies...${NC}"
pip install python-multipart==0.0.6
pip install python-dotenv==1.0.0
pip install aiofiles==23.2.1
pip install httpx==0.28.1
pip install typer==0.9.0

echo -e "${BLUE}📦 Step 6: Installing optional dependencies...${NC}"
pip install emails==0.6
pip install fastapi-mail==1.4.1
pip install Pillow==11.2.1
pip install boto3==1.26.137

echo -e "${BLUE}📦 Step 7: Installing monitoring dependencies...${NC}"
pip install psutil>=5.9.0
pip install structlog>=22.0.0
pip install prometheus-client>=0.15.0
pip install sentry-sdk[fastapi]>=1.0.0

echo -e "${BLUE}📦 Step 8: Installing development dependencies...${NC}"
pip install pytest==7.4.3

echo -e "${BLUE}📦 Step 9: Installing all from requirements.txt (backup)...${NC}"
pip install -r app/requirements.txt

echo -e "${GREEN}✅ Dependencies installation completed!${NC}"

echo -e "${BLUE}🧪 Step 10: Testing imports...${NC}"
python -c "
try:
    import fastapi
    import uvicorn
    import sqlalchemy
    import pydantic
    import pymysql
    print('✅ All core modules imported successfully!')
except ImportError as e:
    print(f'❌ Import error: {e}')
    exit(1)
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 All dependencies installed and working!${NC}"
else
    echo -e "${RED}❌ Some dependencies still have issues${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. sudo systemctl restart hotel-backend"
echo "2. sudo systemctl status hotel-backend"
echo "3. curl http://127.0.0.1:8000/docs"
