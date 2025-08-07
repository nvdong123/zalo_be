#!/bin/bash
# Setup SSL for zalominiapp.vtlink.vn
echo "🔒 SETTING UP SSL FOR zalominiapp.vtlink.vn"
echo "========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📦 Step 1: Install Certbot...${NC}"
sudo dnf install -y epel-release
sudo dnf install -y certbot python3-certbot-nginx

echo -e "${YELLOW}⏸️ Step 2: Stop Nginx for standalone mode...${NC}"
sudo systemctl stop nginx

echo -e "${YELLOW}📜 Step 3: Request SSL certificate...${NC}"
sudo certbot certonly --standalone \
    -d zalominiapp.vtlink.vn \
    -d www.zalominiapp.vtlink.vn \
    --non-interactive \
    --agree-tos \
    --email admin@zalominiapp.vtlink.vn

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificate obtained successfully!${NC}"
    
    echo -e "${YELLOW}🔧 Step 4: Create SSL Nginx config...${NC}"
    sudo tee /etc/nginx/conf.d/zalominiapp-ssl.conf > /dev/null << 'EOF'
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name zalominiapp.vtlink.vn www.zalominiapp.vtlink.vn;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name zalominiapp.vtlink.vn www.zalominiapp.vtlink.vn;
    
    # SSL certificate
    ssl_certificate /etc/letsencrypt/live/zalominiapp.vtlink.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zalominiapp.vtlink.vn/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Domain "zalominiapp.vtlink.vn" always;
    
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
        proxy_set_header X-Forwarded-Proto http;
    }
}
EOF

    # Remove old HTTP-only config
    sudo rm -f /etc/nginx/conf.d/zalominiapp.conf
    
    echo -e "${YELLOW}🧪 Step 5: Test SSL config...${NC}"
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        echo -e "${YELLOW}🚀 Step 6: Start Nginx with SSL...${NC}"
        sudo systemctl start nginx
        
        echo -e "${YELLOW}⏳ Step 7: Test HTTPS...${NC}"
        sleep 5
        
        HTTPS_TEST=$(curl -s https://zalominiapp.vtlink.vn/health 2>/dev/null || echo "failed")
        if echo "$HTTPS_TEST" | grep -q "healthy"; then
            echo -e "${GREEN}"
            echo "🎉 SSL SETUP SUCCESSFUL!"
            echo "======================="
            echo "✅ HTTPS is working!"
            echo ""
            echo "🔒 Your secure endpoints:"
            echo "   • https://zalominiapp.vtlink.vn/docs"
            echo "   • https://zalominiapp.vtlink.vn/health"
            echo "   • https://zalominiapp.vtlink.vn/api/v1/..."
            echo ""
            echo "🌐 Browser will now work perfectly!"
            echo -e "${NC}"
        else
            echo -e "${YELLOW}⚠️ HTTPS might need a moment to activate${NC}"
            echo "Manual test: curl -k https://zalominiapp.vtlink.vn/health"
        fi
    else
        echo -e "${RED}❌ SSL config failed${NC}"
        echo "Reverting to HTTP-only..."
        sudo rm -f /etc/nginx/conf.d/zalominiapp-ssl.conf
        
        sudo tee /etc/nginx/conf.d/zalominiapp.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name zalominiapp.vtlink.vn www.zalominiapp.vtlink.vn _;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto http;
    }
}
EOF
        sudo systemctl start nginx
    fi
    
else
    echo -e "${RED}❌ SSL certificate request failed${NC}"
    echo "Starting with HTTP-only configuration..."
    
    sudo tee /etc/nginx/conf.d/zalominiapp.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name zalominiapp.vtlink.vn www.zalominiapp.vtlink.vn _;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto http;
    }
}
EOF
    
    sudo systemctl start nginx
    echo "Available at: http://zalominiapp.vtlink.vn/"
fi

echo -e "${YELLOW}🔧 Step 8: Setup auto-renewal...${NC}"
sudo systemctl enable --now certbot-renew.timer

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo "Domain: zalominiapp.vtlink.vn"
echo "Check certificate: sudo certbot certificates"
