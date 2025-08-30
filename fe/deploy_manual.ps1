# Manual Frontend Deployment Guide
# Run these commands step by step

Write-Host "🚀 Manual Frontend Deployment Steps" -ForegroundColor Green
Write-Host ""

# Step 1: Upload files using WinSCP or any SCP client
Write-Host "Step 1: Upload files to VPS" -ForegroundColor Yellow
Write-Host "Using SCP command:" -ForegroundColor Cyan
Write-Host 'scp -r dist/* root@157.10.199.22:/var/www/hotel-frontend/' -ForegroundColor White
Write-Host ""

# Step 2: SSH to VPS and configure
Write-Host "Step 2: SSH to VPS and configure" -ForegroundColor Yellow
Write-Host "SSH command:" -ForegroundColor Cyan  
Write-Host 'ssh root@157.10.199.22' -ForegroundColor White
Write-Host ""

Write-Host "Then run these commands on VPS:" -ForegroundColor Cyan
Write-Host @"
# Create directory
mkdir -p /var/www/hotel-frontend

# Set permissions  
chown -R www-data:www-data /var/www/hotel-frontend
chmod -R 755 /var/www/hotel-frontend

# Create simple nginx config
cat > /etc/nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    sendfile        on;
    keepalive_timeout  65;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    upstream backend {
        server 127.0.0.1:8000;
    }

    server {
        listen 80 default_server;
        server_name _;
        
        root /var/www/hotel-frontend;
        index index.html;

        # Frontend - React Router
        location / {
            try_files $uri $uri/ /index.html;
            add_header X-Frame-Options "SAMEORIGIN" always;
            add_header X-Content-Type-Options "nosniff" always;
        }

        # API proxy to backend
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            
            # CORS
            add_header Access-Control-Allow-Origin "*" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
            
            if ($request_method = 'OPTIONS') {
                add_header Access-Control-Allow-Origin "*";
                add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
                add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With";
                add_header Access-Control-Max-Age 1728000;
                add_header Content-Length 0;
                return 204;
            }
        }

        # Health check
        location /health {
            proxy_pass http://backend/health;
        }

        # Static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        location ~ /\. {
            deny all;
        }
    }
}
EOF

# Test and reload nginx
nginx -t && systemctl reload nginx

# Check status
systemctl status nginx
systemctl status hotel-backend

echo "✅ Deployment completed!"
echo "🌐 Frontend: http://157.10.199.22"  
echo "🔧 API: http://157.10.199.22/api/health"
"@ -ForegroundColor White

Write-Host ""
Write-Host "Alternative: Try direct upload command" -ForegroundColor Yellow
