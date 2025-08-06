#!/bin/bash
# Fix Nginx Configuration Conflicts
# This script fixes the conflicting server name issue

echo "🔧 FIXING NGINX CONFIGURATION CONFLICTS"
echo "======================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Step 1: Checking current Nginx configuration files...${NC}"

# Find all nginx config files that might have the conflicting server name
echo "Checking for existing configuration files:"
find /etc/nginx -name "*.conf" -exec grep -l "bookingservices.io.vn" {} \; 2>/dev/null

echo ""
echo -e "${BLUE}🔧 Step 2: Removing conflicting configurations...${NC}"

# Remove any existing configurations that might conflict
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null
sudo rm -f /etc/nginx/sites-available/default 2>/dev/null
sudo rm -f /etc/nginx/conf.d/default.conf 2>/dev/null

# Remove any existing hotel-backend configs
sudo rm -f /etc/nginx/conf.d/hotel-backend.conf 2>/dev/null
sudo rm -f /etc/nginx/sites-enabled/hotel-backend 2>/dev/null
sudo rm -f /etc/nginx/sites-available/hotel-backend 2>/dev/null

echo -e "${GREEN}✅ Old configurations removed${NC}"

echo -e "${BLUE}🔧 Step 3: Creating clean Nginx configuration...${NC}"

# Create a single, clean configuration file
sudo tee /etc/nginx/conf.d/bookingservices.conf > /dev/null << 'EOF'
# Hotel Management System - Nginx Configuration
# Single configuration to avoid conflicts

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name bookingservices.io.vn www.bookingservices.io.vn 157.10.199.22;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name bookingservices.io.vn www.bookingservices.io.vn;
    
    # SSL Configuration (will be configured by certbot)
    # ssl_certificate and ssl_certificate_key will be added by certbot
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # API routes
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint (direct access)
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Root location - redirect to API docs
    location / {
        return 301 /api/docs;
    }
    
    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}

# Fallback server for direct IP access
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    
    server_name 157.10.199.22;
    
    # Self-signed certificate for IP access (fallback)
    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
    
    # API routes for IP access
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        return 301 /api/docs;
    }
}
EOF

echo -e "${GREEN}✅ New configuration created${NC}"

echo -e "${BLUE}🔧 Step 4: Creating self-signed certificate for IP access...${NC}"

# Create self-signed certificate for IP access
sudo mkdir -p /etc/ssl/private
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/nginx-selfsigned.key \
    -out /etc/ssl/certs/nginx-selfsigned.crt \
    -subj "/C=VN/ST=HCM/L=HoChiMinh/O=BookingServices/OU=IT/CN=157.10.199.22"

echo -e "${GREEN}✅ Self-signed certificate created${NC}"

echo -e "${BLUE}🔧 Step 5: Testing Nginx configuration...${NC}"

sudo nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    
    echo -e "${BLUE}🔧 Step 6: Reloading Nginx...${NC}"
    sudo systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"
    else
        echo -e "${RED}❌ Nginx reload failed${NC}"
        sudo systemctl status nginx --no-pager -l
    fi
else
    echo -e "${RED}❌ Nginx configuration test failed${NC}"
    exit 1
fi

echo -e "${BLUE}🔧 Step 7: Testing endpoints...${NC}"

# Test direct IP access
echo "Testing IP access:"
curl -k -s https://157.10.199.22/health >/dev/null && echo "✅ HTTPS IP access works" || echo "❌ HTTPS IP access failed"
curl -s http://157.10.199.22/health >/dev/null && echo "✅ HTTP IP access works" || echo "❌ HTTP IP access failed"

# Test localhost
echo "Testing localhost:"
curl -s http://localhost/health >/dev/null && echo "✅ Localhost access works" || echo "❌ Localhost access failed"

echo ""
echo -e "${GREEN}🎉 NGINX CONFIGURATION FIX COMPLETED!${NC}"
echo ""
echo -e "${YELLOW}📋 Summary of changes:${NC}"
echo "   ✅ Removed conflicting configurations"
echo "   ✅ Created single, clean configuration"
echo "   ✅ Added self-signed certificate for IP access"
echo "   ✅ Configured HTTP to HTTPS redirect"
echo "   ✅ Set up proper proxy headers"
echo ""
echo -e "${YELLOW}🔗 Access points:${NC}"
echo "   • HTTP IP: http://157.10.199.22/api/docs"
echo "   • HTTPS IP: https://157.10.199.22/api/docs"
echo "   • Health check: https://157.10.199.22/health"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "   1. Test the endpoints above"
echo "   2. Configure SSL with Let's Encrypt: sudo certbot --nginx -d bookingservices.io.vn"
echo "   3. Point your domain to this server if not done already"
echo ""
echo -e "${BLUE}💡 Note: The self-signed certificate will show security warnings${NC}"
echo "   This is normal for IP access. Use domain access for production."
