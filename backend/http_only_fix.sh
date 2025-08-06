#!/bin/bash
# IMMEDIATE FIX: Remove SSL config and use HTTP only
echo "🔧 IMMEDIATE FIX: HTTP ONLY"
echo "=========================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🧹 Removing all SSL configs...${NC}"
sudo rm -f /etc/nginx/conf.d/*ssl* /etc/nginx/conf.d/nevascore*

echo -e "${YELLOW}🔧 Creating simple HTTP-only config...${NC}"
sudo tee /etc/nginx/conf.d/http-only.conf > /dev/null << 'EOF'
server {
    listen 80 default_server;
    server_name nevascore.id.vn www.nevascore.id.vn 157.10.199.22 _;
    
    # Headers to prevent HTTPS redirect
    add_header Strict-Transport-Security "max-age=0; includeSubDomains" always;
    add_header X-Protocol "HTTP" always;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto http;
        proxy_set_header X-Forwarded-Host $host;
    }
}
EOF

echo -e "${YELLOW}🧪 Testing config...${NC}"
sudo nginx -t

if [ $? -eq 0 ]; then
    echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"
    sudo systemctl reload nginx
    
    echo -e "${YELLOW}⏳ Testing after reload...${NC}"
    sleep 3
    
    HTTP_TEST=$(curl -s http://nevascore.id.vn/health)
    if echo "$HTTP_TEST" | grep -q "healthy"; then
        echo -e "${GREEN}"
        echo "🎉 SUCCESS! HTTP is working!"
        echo "=========================="
        echo ""
        echo "🌐 Working endpoints:"
        echo "   • http://nevascore.id.vn/docs"
        echo "   • http://nevascore.id.vn/health"
        echo "   • http://nevascore.id.vn/"
        echo ""
        echo "💡 Browser instructions:"
        echo "   1. Clear browser cache (Ctrl+Shift+Delete)"
        echo "   2. Type EXACTLY: http://nevascore.id.vn/docs"
        echo "   3. Or use Incognito mode (Ctrl+Shift+N)"
        echo ""
        echo "Response: $HTTP_TEST"
        echo -e "${NC}"
    else
        echo -e "${RED}❌ Still having issues${NC}"
        echo "Response: $HTTP_TEST"
    fi
else
    echo -e "${RED}❌ Config failed${NC}"
fi

echo ""
echo -e "${YELLOW}📊 Current status:${NC}"
echo "Nginx: $(sudo systemctl is-active nginx)"
echo "FastAPI: $(curl -s http://127.0.0.1:8000/health | jq -r .status 2>/dev/null || echo 'unknown')"
