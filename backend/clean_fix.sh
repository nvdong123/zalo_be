#!/bin/bash
# CLEAN FIX: Remove all conflicts and create simple config
echo "🧹 CLEAN FIX: Remove conflicts"
echo "============================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🧹 Step 1: Clean ALL configs...${NC}"
sudo rm -f /etc/nginx/conf.d/*.conf
sudo rm -f /etc/nginx/sites-enabled/*
sudo rm -f /etc/nginx/sites-available/*

echo -e "${YELLOW}🔧 Step 2: Create single clean config...${NC}"
sudo tee /etc/nginx/conf.d/clean.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name nevascore.id.vn www.nevascore.id.vn;
    
    # Headers to prevent HTTPS redirect
    add_header Strict-Transport-Security "max-age=0" always;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto http;
        proxy_set_header X-Forwarded-Host $host;
    }
}

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

echo -e "${YELLOW}🧪 Step 3: Test config...${NC}"
sudo nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Config is valid!${NC}"
    
    echo -e "${YELLOW}🔄 Step 4: Reload Nginx...${NC}"
    sudo systemctl reload nginx
    
    echo -e "${YELLOW}⏳ Step 5: Test endpoints...${NC}"
    sleep 3
    
    echo "Testing domain:"
    DOMAIN_TEST=$(curl -s http://nevascore.id.vn/health)
    echo "Domain response: $DOMAIN_TEST"
    
    echo "Testing IP:"
    IP_TEST=$(curl -s http://157.10.199.22/health)
    echo "IP response: $IP_TEST"
    
    if echo "$DOMAIN_TEST" | grep -q "healthy"; then
        echo -e "${GREEN}"
        echo "🎉 SUCCESS! Domain is working!"
        echo "=========================="
        echo ""
        echo "🌐 Working endpoints:"
        echo "   • http://nevascore.id.vn/docs"
        echo "   • http://nevascore.id.vn/health"
        echo "   • http://nevascore.id.vn/"
        echo ""
        echo "💡 For browser:"
        echo "   1. Clear cache (Ctrl+Shift+Delete)"
        echo "   2. Type: http://nevascore.id.vn/docs"
        echo "   3. Use Incognito if needed"
        echo -e "${NC}"
    else
        echo -e "${RED}❌ Domain still not working${NC}"
        echo "Check FastAPI: $(curl -s http://127.0.0.1:8000/health | head -c 50)..."
    fi
    
else
    echo -e "${RED}❌ Config still failed${NC}"
    echo "Nginx error details:"
    sudo nginx -t 2>&1
fi

echo ""
echo -e "${YELLOW}📊 System status:${NC}"
echo "Nginx: $(sudo systemctl is-active nginx)"
echo "FastAPI health: $(curl -s http://127.0.0.1:8000/health | jq -r .status 2>/dev/null || echo 'check failed')"
