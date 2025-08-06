#!/bin/bash
# Quick fix for browser HTTPS redirect issue
echo "🔧 QUICK FIX FOR BROWSER HTTPS REDIRECT"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔧 Creating browser-friendly HTTP config...${NC}"

# Create a config that handles browser redirects better
sudo tee /etc/nginx/conf.d/browser-fix.conf > /dev/null << 'EOF'
server {
    listen 80 default_server;
    server_name nevascore.id.vn www.nevascore.id.vn 157.10.199.22 _;
    
    # Prevent browser from auto-redirecting to HTTPS
    add_header Strict-Transport-Security "max-age=0" always;
    
    # Custom headers to identify we're serving HTTP
    add_header X-Protocol "HTTP" always;
    add_header X-Served-By "nevascore-http" always;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto http;
        proxy_set_header X-Forwarded-Host $host;
        
        # Additional headers for browser compatibility
        proxy_set_header Connection "";
        proxy_http_version 1.1;
    }
}
EOF

echo -e "${YELLOW}🧹 Removing conflicting configs...${NC}"
sudo find /etc/nginx/conf.d/ -name "*.conf" ! -name "browser-fix.conf" -exec rm {} \;

echo -e "${YELLOW}🧪 Testing config...${NC}"
sudo nginx -t

if [ $? -eq 0 ]; then
    echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"
    sudo systemctl reload nginx
    
    echo -e "${YELLOW}⏳ Testing after reload...${NC}"
    sleep 3
    
    # Test the configuration
    HTTP_TEST=$(curl -s -I http://nevascore.id.vn/health | head -1)
    echo "HTTP Test result: $HTTP_TEST"
    
    if echo "$HTTP_TEST" | grep -q "200 OK"; then
        echo -e "${GREEN}"
        echo "✅ SUCCESS! HTTP is working properly"
        echo "=================================="
        echo ""
        echo "🌐 Try these in your browser:"
        echo "   • http://nevascore.id.vn/docs"
        echo "   • http://nevascore.id.vn/health"
        echo "   • http://nevascore.id.vn/"
        echo ""
        echo "💡 Browser tips:"
        echo "   1. Type EXACTLY: http://nevascore.id.vn/docs"
        echo "   2. Or use Incognito mode (Ctrl+Shift+N)"
        echo "   3. Clear browser cache if still issues"
        echo -e "${NC}"
    else
        echo -e "${RED}❌ Still having issues${NC}"
    fi
else
    echo -e "${RED}❌ Nginx config failed${NC}"
fi

echo ""
echo -e "${YELLOW}📊 Current Nginx status:${NC}"
sudo systemctl status nginx --no-pager -l
