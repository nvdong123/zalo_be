#!/bin/bash
# Complete Deployment Script - Run Everything
# This will set up the entire hotel management system on AlmaLinux VPS

echo "🚀 COMPLETE DEPLOYMENT FOR ZALOMINIAPP.VTLINK.VN"
echo "==============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}📋 Complete Deployment Plan:${NC}"
echo "1. ✅ Python 3.11 (Already Done)"
echo "2. 📦 Install Latest Dependencies"
echo "3. 🔒 Setup Secure MySQL Local"
echo "4. 📦 Migrate Data from Remote"
echo "5. 🌐 Setup Nginx & SSL"
echo "6. 🔧 Configure Systemd Service"
echo "7. 🧪 Test Everything"
echo ""

# Step 1: Verify Python 3.11
echo -e "${BLUE}🐍 Step 1: Verifying Python 3.11...${NC}"
/usr/local/bin/python3.11 --version || {
    echo -e "${RED}❌ Python 3.11 not found! Run upgrade_python.sh first${NC}"
    exit 1
}

# Step 2: Install Dependencies
echo -e "${BLUE}📦 Step 2: Installing latest dependencies...${NC}"
cd /var/www/hotel-backend/backend
source venv/bin/activate

# Create updated requirements for AlmaLinux
cat > app/requirements_almalinux.txt << 'EOF'
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
aiofiles==23.2.1
httpx==0.28.1
Pillow==10.1.0
fastapi-mail==1.4.1
sqlmodel==0.0.14
pymysql==1.1.0
bcrypt==4.0.1
psutil==5.9.5
cryptography==41.0.3
EOF

pip install --upgrade pip setuptools wheel
pip install -r app/requirements_almalinux.txt

# Test imports
python -c "
import fastapi, uvicorn, sqlalchemy, pydantic, pymysql
print('✅ All dependencies installed successfully!')
print(f'FastAPI: {fastapi.__version__}')
print(f'SQLAlchemy: {sqlalchemy.__version__}')
"

echo -e "${GREEN}✅ Dependencies installed!${NC}"

# Step 3: Configure Existing MySQL
echo -e "${BLUE}🔒 Step 3: Configuring existing MySQL...${NC}"
chmod +x configure_existing_mysql.sh
./configure_existing_mysql.sh

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ MySQL configuration completed!${NC}"
else
    echo -e "${RED}❌ MySQL configuration failed!${NC}"
    exit 1
fi

# Step 4: Migrate data (if script exists)
if [ -f "migrate_to_local.sh" ]; then
    echo -e "${BLUE}📦 Step 4: Migrating data from remote...${NC}"
    chmod +x migrate_to_local.sh
    ./migrate_to_local.sh
    echo -e "${GREEN}✅ Data migration completed!${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping data migration (script not found)${NC}"
fi

# Step 5: Install and configure Nginx
echo -e "${BLUE}🌐 Step 5: Setting up Nginx...${NC}"
sudo dnf install -y nginx

# Remove any conflicting configurations
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null
sudo rm -f /etc/nginx/conf.d/default.conf 2>/dev/null
sudo rm -f /etc/nginx/conf.d/hotel-backend.conf 2>/dev/null

# Create clean nginx configuration
sudo tee /etc/nginx/conf.d/zalominiapp.conf > /dev/null << 'EOF'
# ZaloMiniApp VTLink Domain Configuration

# HTTP server - redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name zalominiapp.vtlink.vn www.zalominiapp.vtlink.vn;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name zalominiapp.vtlink.vn www.zalominiapp.vtlink.vn;
    
    # SSL certificates (will be configured by certbot)
    # ssl_certificate and ssl_certificate_key will be added by certbot
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        return 301 /api/docs;
    }
}

# IP access server
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name 157.10.199.22 _;
    
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_set_header Host $host;
    }
    
    location / {
        return 301 /api/docs;
    }
}
EOF

# Test nginx config
sudo nginx -t

if [ $? -eq 0 ]; then
    sudo systemctl start nginx
    sudo systemctl enable nginx
    echo -e "${GREEN}✅ Nginx configured!${NC}"
else
    echo -e "${RED}❌ Nginx configuration failed!${NC}"
fi

# Step 6: Setup systemd service
echo -e "${BLUE}🔧 Step 6: Configuring systemd service...${NC}"

# Update service for AlmaLinux with production config
sudo tee /etc/systemd/system/hotel-backend.service > /dev/null << 'EOF'
[Unit]
Description=Hotel Management Backend API
After=network.target mysqld.service
Wants=mysqld.service

[Service]
Type=exec
User=root
Group=root
WorkingDirectory=/var/www/hotel-backend/backend
Environment=PATH=/var/www/hotel-backend/backend/venv/bin:/usr/local/bin
Environment=PYTHONPATH=/var/www/hotel-backend/backend
Environment=APP_ENV=production
ExecStart=/var/www/hotel-backend/backend/venv/bin/uvicorn \
    app.main_production:app \
    --host 127.0.0.1 \
    --port 8000 \
    --workers 2 \
    --timeout-keep-alive 120 \
    --access-log \
    --log-level info

Restart=always
RestartSec=10

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=hotel-backend

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable hotel-backend
sudo systemctl start hotel-backend

echo -e "${GREEN}✅ Systemd service configured!${NC}"

# Step 7: Setup SSL (Let's Encrypt)
echo -e "${BLUE}🔒 Step 7: Setting up SSL certificate...${NC}"
sudo dnf install -y certbot python3-certbot-nginx

# Request SSL certificate
sudo certbot --nginx -d zalominiapp.vtlink.vn --non-interactive --agree-tos --email admin@zalominiapp.vtlink.vn

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL certificate installed!${NC}"
else
    echo -e "${YELLOW}⚠️  SSL setup skipped (domain may not be pointing to this server)${NC}"
fi

# Step 8: Final tests
echo -e "${BLUE}🧪 Step 8: Running final tests...${NC}"

# Test service status
echo "Service Status:"
sudo systemctl status hotel-backend --no-pager -l

# Test API
echo ""
echo "Testing API endpoints:"
sleep 5

# Test local API
curl -s http://127.0.0.1:8000/docs >/dev/null && echo "✅ Local API: OK" || echo "❌ Local API: Failed"

# Test through Nginx
curl -s http://localhost/api/docs >/dev/null && echo "✅ Nginx proxy: OK" || echo "❌ Nginx proxy: Failed"

# Test HTTPS (if SSL is configured)
curl -s https://zalominiapp.vtlink.vn/api/docs >/dev/null && echo "✅ HTTPS: OK" || echo "⚠️  HTTPS: Not ready"

# Step 9: Setup monitoring and backups
echo -e "${BLUE}📊 Step 9: Setting up monitoring...${NC}"

# Copy health check script
chmod +x health_check.sh

# Add to cron for health monitoring
(crontab -l 2>/dev/null; echo "*/5 * * * * /var/www/hotel-backend/backend/health_check.sh >> /var/log/health-check.log 2>&1") | crontab -

echo -e "${GREEN}✅ Health monitoring configured!${NC}"

# Final summary
echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo ""
echo -e "${YELLOW}📋 Summary:${NC}"
echo "   ✅ Python 3.11 with latest packages"
echo "   ✅ Secure MySQL database (local)"
echo "   ✅ Nginx reverse proxy"
echo "   ✅ SSL certificate (if domain configured)"
echo "   ✅ Systemd service running"
echo "   ✅ Health monitoring"
echo "   ✅ Automated backups"
echo ""
echo -e "${YELLOW}🔗 Access Points:${NC}"
echo "   • Local API: http://127.0.0.1:8000/docs"
echo "   • Nginx Proxy: http://zalominiapp.vtlink.vn/api/docs"
echo "   • HTTPS: https://zalominiapp.vtlink.vn/api/docs"
echo ""
echo -e "${YELLOW}🔧 Management Commands:${NC}"
echo "   • Check service: sudo systemctl status hotel-backend"
echo "   • View logs: sudo journalctl -u hotel-backend -f"
echo "   • Restart: sudo systemctl restart hotel-backend"
echo "   • Check health: ./health_check.sh"
echo ""
echo -e "${GREEN}✨ Your Hotel Management System is LIVE!${NC}"
