#!/bin/bash
# Setup SSL Certificate for nevascore.id.vn
echo "🔒 SETTING UP SSL CERTIFICATE"
echo "============================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📦 Installing Certbot...${NC}"
sudo dnf install -y epel-release
sudo dnf install -y certbot python3-certbot-nginx

echo -e "${YELLOW}🔧 Updating Nginx config for SSL...${NC}"
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
    
    # SSL certificate paths (will be updated by certbot)
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
        proxy_set_header X-Forwarded-Proto $scheme;
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

echo -e "${YELLOW}🧹 Removing old configs...${NC}"
sudo rm -f /etc/nginx/conf.d/domain.conf /etc/nginx/conf.d/simple.conf /etc/nginx/conf.d/nevascore.conf

echo -e "${YELLOW}🧪 Testing Nginx config...${NC}"
sudo nginx -t

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Nginx config failed. Reverting...${NC}"
    sudo tee /etc/nginx/conf.d/simple.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    sudo nginx -t && sudo systemctl reload nginx
    exit 1
fi

echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"
sudo systemctl reload nginx

echo -e "${YELLOW}🔒 Obtaining SSL certificate...${NC}"
echo "This will request SSL certificate from Let's Encrypt..."
echo "Domain: nevascore.id.vn"
echo ""

# Get SSL certificate
sudo certbot --nginx -d nevascore.id.vn -d www.nevascore.id.vn --non-interactive --agree-tos --email admin@nevascore.id.vn --redirect

if [ $? -eq 0 ]; then
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
    echo -e "${NC}"
    
    # Test HTTPS
    echo -e "${YELLOW}🧪 Testing HTTPS...${NC}"
    HTTPS_TEST=$(curl -s https://nevascore.id.vn/health)
    if echo "$HTTPS_TEST" | grep -q "healthy"; then
        echo -e "${GREEN}✅ HTTPS test successful!${NC}"
        echo "Response: $HTTPS_TEST"
    else
        echo -e "${YELLOW}⚠️ HTTPS might need a moment to activate${NC}"
    fi
else
    echo -e "${RED}❌ SSL certificate installation failed${NC}"
    echo "You can still use HTTP: http://nevascore.id.vn/"
    echo "Or try again later with: sudo certbot --nginx -d nevascore.id.vn"
fi

echo -e "${YELLOW}🔧 Setting up auto-renewal...${NC}"
sudo systemctl enable --now certbot-renew.timer

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo "Check status: sudo systemctl status certbot-renew.timer"
