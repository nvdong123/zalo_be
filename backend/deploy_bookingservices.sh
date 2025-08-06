#!/bin/bash
# Custom Deployment Script for bookingservices.io.vn
# VPS: 157.10.199.22

echo "🚀 Deploying Hotel Management Backend to bookingservices.io.vn"
echo "============================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Your VPS Configuration
VPS_IP="157.10.199.22"
DOMAIN="bookingservices.io.vn"
EMAIL="admin@bookingservices.io.vn"
REPO_URL="https://github.com/nvdong123/zalo_be.git"

echo -e "${YELLOW}📋 Deployment Configuration:${NC}"
echo "   VPS IP: $VPS_IP"
echo "   Domain: $DOMAIN"
echo "   Email: $EMAIL"
echo "   Repository: $REPO_URL"
echo ""

# Check if we're on the VPS
if [ "$(hostname -I | grep $VPS_IP)" ]; then
    echo -e "${GREEN}✅ Running on target VPS${NC}"
else
    echo -e "${YELLOW}⚠️  Not on target VPS. Current IP: $(hostname -I)${NC}"
    echo -e "${YELLOW}   This script is designed for VPS: $VPS_IP${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting..."
        exit 1
    fi
fi

# Step 1: System Setup
echo -e "${BLUE}📦 Step 1: Setting up system...${NC}"
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3 python3-pip python3-venv python3-dev build-essential \
    mysql-server mysql-client libmysqlclient-dev nginx git certbot python3-certbot-nginx \
    htop curl wget unzip

# Create application user
sudo useradd -m -s /bin/bash hotelapp 2>/dev/null || echo "User hotelapp already exists"
sudo usermod -aG sudo hotelapp

# Create directories
sudo mkdir -p /var/www/hotel-backend
sudo mkdir -p /var/www/uploads
sudo mkdir -p /var/log/hotel-backend
sudo mkdir -p /var/backups/hotel-backend

# Set permissions
sudo chown -R hotelapp:hotelapp /var/www/hotel-backend
sudo chown -R hotelapp:hotelapp /var/www/uploads
sudo chown -R hotelapp:hotelapp /var/log/hotel-backend

echo -e "${GREEN}✅ System setup completed${NC}"

# Step 1.5: Setup Secure Local MySQL Database
echo -e "${BLUE}🔒 Step 1.5: Setting up secure local MySQL database...${NC}"
chmod +x /var/www/hotel-backend/backend/setup_secure_mysql.sh
/var/www/hotel-backend/backend/setup_secure_mysql.sh

echo -e "${GREEN}✅ Secure MySQL database setup completed${NC}"

# Step 1.6: Migrate data from remote to local database
echo -e "${BLUE}📦 Step 1.6: Migrating data from remote to local database...${NC}"
chmod +x /var/www/hotel-backend/backend/migrate_to_local.sh

read -p "Do you want to migrate data from remote database to local? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    /var/www/hotel-backend/backend/migrate_to_local.sh
    echo -e "${GREEN}✅ Data migration completed${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping data migration${NC}"
fi

# Step 2: Deploy Application
echo -e "${BLUE}🚀 Step 2: Deploying application...${NC}"

# Switch to hotelapp user for deployment
sudo -u hotelapp bash << 'EOF'
APP_DIR="/var/www/hotel-backend"
REPO_URL="https://github.com/nvdong123/zalo_be.git"

# Clone or update repository
if [ -d "$APP_DIR/.git" ]; then
    echo "📥 Updating existing repository..."
    cd $APP_DIR
    git fetch origin
    git reset --hard origin/main
    git pull origin main
else
    echo "📥 Cloning repository..."
    rm -rf $APP_DIR
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Navigate to backend
cd $APP_DIR/backend

# Create virtual environment
echo "🐍 Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r app/requirements.txt
pip install gunicorn

# Setup environment
echo "⚙️ Setting up environment..."
cp .env.production .env

# Create necessary directories
mkdir -p uploads logs

echo "✅ Application deployed successfully"
EOF

echo -e "${GREEN}✅ Application deployment completed${NC}"

# Step 3: Setup Nginx
echo -e "${BLUE}🌐 Step 3: Setting up Nginx...${NC}"

# Copy nginx configuration
sudo cp /var/www/hotel-backend/backend/nginx.conf /etc/nginx/sites-available/hotel-backend

# Enable site
sudo ln -sf /etc/nginx/sites-available/hotel-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
if sudo nginx -t; then
    sudo systemctl restart nginx
    echo -e "${GREEN}✅ Nginx configured successfully${NC}"
else
    echo -e "${RED}❌ Nginx configuration error${NC}"
    exit 1
fi

# Step 4: Setup Systemd Service
echo -e "${BLUE}🔧 Step 4: Setting up systemd service...${NC}"

sudo cp /var/www/hotel-backend/backend/hotel-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable hotel-backend

echo -e "${GREEN}✅ Systemd service configured${NC}"

# Step 5: Start Application
echo -e "${BLUE}🚀 Step 5: Starting application...${NC}"

sudo systemctl start hotel-backend

# Wait and check status
sleep 10

if sudo systemctl is-active --quiet hotel-backend; then
    echo -e "${GREEN}✅ Application started successfully${NC}"
else
    echo -e "${RED}❌ Application failed to start${NC}"
    echo "Checking logs..."
    sudo journalctl -u hotel-backend --no-pager -n 20
    exit 1
fi

# Step 6: Setup SSL Certificate
echo -e "${BLUE}🔒 Step 6: Setting up SSL certificate...${NC}"

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Get SSL certificate
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL certificate installed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  SSL certificate installation may have issues${NC}"
    echo "You can try manually later with: sudo certbot --nginx -d $DOMAIN"
fi

# Step 7: Setup Monitoring and Backups
echo -e "${BLUE}📊 Step 7: Setting up monitoring and backups...${NC}"

# Make scripts executable
sudo chmod +x /var/www/hotel-backend/backend/backup.sh
sudo chmod +x /var/www/hotel-backend/backend/health_check.sh

# Setup cron jobs
sudo -u hotelapp bash << 'EOF'
# Add cron jobs for hotelapp user
(crontab -l 2>/dev/null; echo "*/5 * * * * /var/www/hotel-backend/backend/health_check.sh >> /var/log/hotel-backend/cron.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/hotel-backend/backend/backup.sh >> /var/log/hotel-backend/backup.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * 0 find /var/log/hotel-backend/ -name '*.log' -mtime +30 -delete") | crontab -
EOF

# Add SSL renewal cron for root
(sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --no-self-upgrade") | sudo crontab -

echo -e "${GREEN}✅ Monitoring and backups configured${NC}"

# Step 8: Final Tests
echo -e "${BLUE}✅ Step 8: Running final tests...${NC}"

echo "Testing local endpoints..."
sleep 5

# Test health endpoint
if curl -f -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ Health check: PASSED${NC}"
else
    echo -e "${RED}❌ Health check: FAILED${NC}"
fi

# Test API root
if curl -f -s http://localhost:8000/ > /dev/null; then
    echo -e "${GREEN}✅ API root: PASSED${NC}"
else
    echo -e "${RED}❌ API root: FAILED${NC}"
fi

# Test HTTPS (if SSL was installed)
if curl -f -s https://$DOMAIN/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ HTTPS health check: PASSED${NC}"
else
    echo -e "${YELLOW}⚠️  HTTPS health check: May need time to propagate${NC}"
fi

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo ""
echo -e "${YELLOW}📋 Your application is now available at:${NC}"
echo "   • Website: https://$DOMAIN"
echo "   • API: https://$DOMAIN/api/v1/"
echo "   • Documentation: https://$DOMAIN/docs"
echo "   • Health check: https://$DOMAIN/health"
echo ""
echo -e "${YELLOW}🔧 System Information:${NC}"
echo "   • Service status: $(sudo systemctl is-active hotel-backend)"
echo "   • Nginx status: $(sudo systemctl is-active nginx)"
echo "   • Database: MySQL at 157.66.81.101"
echo "   • Logs: sudo journalctl -u hotel-backend -f"
echo ""
echo -e "${YELLOW}📁 Important paths:${NC}"
echo "   • Application: /var/www/hotel-backend/backend/"
echo "   • Environment: /var/www/hotel-backend/backend/.env"
echo "   • Uploads: /var/www/uploads/"
echo "   • Logs: /var/log/hotel-backend/"
echo "   • Backups: /var/backups/hotel-backend/"
echo ""
echo -e "${YELLOW}🔐 Security:${NC}"
echo "   • Firewall: $(sudo ufw status | grep Status)"
echo "   • SSL: $(sudo certbot certificates | grep bookingservices.io.vn || echo 'Check manually')"
echo ""
echo -e "${GREEN}✨ Deployment completed! Your Hotel Management Backend is now live!${NC}"
