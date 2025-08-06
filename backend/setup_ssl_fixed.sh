#!/bin/bash
# Setup SSL Certificate for nevascore.id.vn - FIXED VERSION
echo "🔒 SETTING UP SSL CERTIFICATE (FIXED)"
echo "===================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📦 Installing Certbot...${NC}"
sudo dnf install -y epel-release
sudo dnf install -y certbot python3-certbot-nginx

echo -e "${YELLOW}🔧 Step 1: Create basic HTTP config first...${NC}"
sudo tee /etc/nginx/conf.d/nevascore-temp.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name nevascore.id.vn www.nevascore.id.vn;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
}

# Keep IP access
server {
    listen 80;
    server_name 157.10.199.22;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo -e "${YELLOW}🧹 Removing old configs...${NC}"
sudo rm -f /etc/nginx/conf.d/nevascore-ssl.conf /etc/nginx/conf.d/domain.conf /etc/nginx/conf.d/simple.conf /etc/nginx/conf.d/nevascore.conf

echo -e "${YELLOW}🧪 Testing basic config...${NC}"
sudo nginx -t

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Basic config failed${NC}"
    exit 1
fi

echo -e "${YELLOW}🔄 Reloading Nginx with basic config...${NC}"
sudo systemctl reload nginx

echo -e "${YELLOW}🔒 Step 2: Now getting SSL certificate...${NC}"
echo "This will request SSL certificate from Let's Encrypt..."
echo "Domain: nevascore.id.vn"
echo ""

# Stop nginx temporarily for certbot standalone mode
echo -e "${YELLOW}⏸️ Stopping Nginx temporarily...${NC}"
sudo systemctl stop nginx

# Get SSL certificate using standalone mode (more reliable)
echo -e "${YELLOW}📜 Requesting certificate...${NC}"
sudo certbot certonly --standalone -d nevascore.id.vn -d www.nevascore.id.vn --non-interactive --agree-tos --email admin@nevascore.id.vn

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificate obtained successfully!${NC}"
    
    echo -e "${YELLOW}🔧 Step 3: Creating SSL config...${NC}"
    sudo tee /etc/nginx/conf.d/nevascore-ssl.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name nevascore.id.vn www.nevascore.id.vn;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name nevascore.id.vn www.nevascore.id.vn;
    
    # SSL certificate paths
    ssl_certificate /etc/letsencrypt/live/nevascore.id.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nevascore.id.vn/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
    }
}

# Keep IP access on HTTP
server {
    listen 80;
    server_name 157.10.199.22;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

    # Remove temporary config
    sudo rm -f /etc/nginx/conf.d/nevascore-temp.conf
    
    echo -e "${YELLOW}🧪 Testing SSL config...${NC}"
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        echo -e "${YELLOW}🚀 Starting Nginx with SSL...${NC}"
        sudo systemctl start nginx
        
        # Test HTTPS
        echo -e "${YELLOW}🧪 Testing HTTPS...${NC}"
        sleep 5
        HTTPS_TEST=$(curl -s https://nevascore.id.vn/health)
        if echo "$HTTPS_TEST" | grep -q "healthy"; then
            echo -e "${GREEN}"
            echo "🎉 SSL CERTIFICATE INSTALLED SUCCESSFULLY!"
            echo "========================================"
            echo "✅ HTTPS is now enabled!"
            echo ""
            echo "🌐 Your secure endpoints:"
            echo "   • https://nevascore.id.vn/"
            echo "   • https://nevascore.id.vn/health"
            echo "   • https://nevascore.id.vn/docs"
            echo ""
            echo "🔒 Browser will now work perfectly!"
            echo "Response: $HTTPS_TEST"
            echo -e "${NC}"
        else
            echo -e "${YELLOW}⚠️ HTTPS might need a moment to activate${NC}"
            echo "You can test manually: curl -k https://nevascore.id.vn/health"
        fi
    else
        echo -e "${RED}❌ SSL config failed, starting with basic config${NC}"
        sudo mv /etc/nginx/conf.d/nevascore-ssl.conf /etc/nginx/conf.d/nevascore-ssl.conf.backup
        sudo mv /etc/nginx/conf.d/nevascore-temp.conf.backup /etc/nginx/conf.d/nevascore-temp.conf
        sudo systemctl start nginx
    fi
    
else
    echo -e "${RED}❌ SSL certificate request failed${NC}"
    echo "Restarting with basic HTTP config..."
    sudo systemctl start nginx
    echo ""
    echo "You can still use HTTP: http://nevascore.id.vn/"
fi

echo -e "${YELLOW}🔧 Setting up auto-renewal...${NC}"
sudo systemctl enable --now certbot-renew.timer

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo "Check certificate status: sudo certbot certificates"
echo "Check auto-renewal: sudo systemctl status certbot-renew.timer"
