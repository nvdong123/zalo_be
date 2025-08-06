#!/bin/bash
# VPS Setup Script for Hotel Management Backend

echo "🚀 Setting up VPS for Hotel Management Backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
echo -e "${YELLOW}🐍 Installing Python and dependencies...${NC}"
sudo apt install python3 python3-pip python3-venv python3-dev build-essential -y

# Install MySQL client (for connecting to remote MySQL)
echo -e "${YELLOW}🗄️ Installing MySQL client...${NC}"
sudo apt install mysql-client-core-8.0 libmysqlclient-dev -y

# Install Nginx
echo -e "${YELLOW}🌐 Installing Nginx...${NC}"
sudo apt install nginx -y

# Install Git
echo -e "${YELLOW}📂 Installing Git...${NC}"
sudo apt install git -y

# Install SSL
echo -e "${YELLOW}🔒 Installing SSL certificates tools...${NC}"
sudo apt install certbot python3-certbot-nginx -y

# Install additional tools
echo -e "${YELLOW}🛠️ Installing additional tools...${NC}"
sudo apt install htop curl wget unzip -y

# Create application user
echo -e "${YELLOW}👤 Creating application user...${NC}"
sudo useradd -m -s /bin/bash hotelapp
sudo usermod -aG sudo hotelapp

# Create directories
echo -e "${YELLOW}📁 Creating application directories...${NC}"
sudo mkdir -p /var/www/hotel-backend
sudo mkdir -p /var/www/uploads
sudo mkdir -p /var/log/hotel-backend

# Set permissions
sudo chown -R hotelapp:hotelapp /var/www/hotel-backend
sudo chown -R hotelapp:hotelapp /var/www/uploads
sudo chown -R hotelapp:hotelapp /var/log/hotel-backend

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Start and enable services
echo -e "${YELLOW}🚀 Starting services...${NC}"
sudo systemctl start nginx
sudo systemctl enable nginx

echo -e "${GREEN}✅ VPS setup completed successfully!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Run the deployment script as hotelapp user"
echo "2. Configure your domain DNS to point to this server"
echo "3. Update the .env file with production values"
echo "4. Setup SSL certificate with certbot"

echo -e "${GREEN}🎉 VPS is ready for deployment!${NC}"
