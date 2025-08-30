# Simple Frontend Deployment Script
param(
    [string]$VpsIp = "157.10.199.22",
    [string]$VpsUser = "root"
)

Write-Host "🚀 Starting Simple Frontend Deployment..." -ForegroundColor Green

# Step 1: Build frontend
Write-Host "📦 Building frontend..." -ForegroundColor Yellow

if (!(Test-Path "package.json")) {
    Write-Host "❌ Please run this from the fe directory" -ForegroundColor Red
    exit 1
}

# Build
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

if (!(Test-Path "dist")) {
    Write-Host "❌ Build output not found!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed!" -ForegroundColor Green

# Step 2: Upload files
Write-Host "📤 Uploading files..." -ForegroundColor Yellow

# Create frontend directory
ssh "$VpsUser@$VpsIp" "mkdir -p /var/www/hotel-frontend"

# Upload all files
scp -r "dist/*" "$VpsUser@${VpsIp}:/var/www/hotel-frontend/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Files uploaded!" -ForegroundColor Green

# Step 3: Simple nginx config (direct to nginx.conf)
Write-Host "⚙️ Setting up nginx..." -ForegroundColor Yellow

$nginxConfig = @"
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    sendfile        on;
    keepalive_timeout  65;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Backend API server (existing)
    upstream backend {
        server 127.0.0.1:8000;
    }

    # Main server block
    server {
        listen 80 default_server;
        server_name $VpsIp _;
        
        root /var/www/hotel-frontend;
        index index.html;

        # Frontend - React Router handling
        location / {
            try_files `$uri `$uri/ /index.html;
            
            # Security headers
            add_header X-Frame-Options "SAMEORIGIN" always;
            add_header X-Content-Type-Options "nosniff" always;
            add_header X-XSS-Protection "1; mode=block" always;
        }

        # API proxy to backend
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host `$host;
            proxy_set_header X-Real-IP `$remote_addr;
            proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto `$scheme;
            
            # CORS headers
            add_header Access-Control-Allow-Origin "*" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
            
            if (`$request_method = 'OPTIONS') {
                add_header Access-Control-Allow-Origin "*";
                add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
                add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With";
                add_header Access-Control-Max-Age 1728000;
                add_header Content-Length 0;
                return 204;
            }
        }

        # Health check endpoint
        location /health {
            proxy_pass http://backend/health;
        }

        # Static assets with caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)`$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            try_files `$uri =404;
        }

        # Security - deny hidden files
        location ~ /\. {
            deny all;
        }
        
        # Error pages
        error_page 404 /index.html;
    }
}
"@

# Write nginx config to temp file
$nginxConfig | Out-File -FilePath "nginx_temp.conf" -Encoding UTF8

# Backup current nginx config and upload new one
ssh "$VpsUser@$VpsIp" "cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup"
scp "nginx_temp.conf" "$VpsUser@${VpsIp}:/etc/nginx/nginx.conf"

# Test and reload nginx
ssh "$VpsUser@$VpsIp" @"
# Set proper permissions
chown -R www-data:www-data /var/www/hotel-frontend 2>/dev/null || chown -R nginx:nginx /var/www/hotel-frontend
chmod -R 755 /var/www/hotel-frontend

# Test nginx config
nginx -t

if [ `$? -eq 0 ]; then
    echo '✅ Nginx config is valid'
    systemctl reload nginx
    echo '✅ Nginx reloaded successfully'
    echo ''
    echo '🌐 Frontend deployed at: http://$VpsIp'
    echo '🔧 Backend API at: http://$VpsIp/api'
    echo ''
else
    echo '❌ Nginx config error, restoring backup'
    cp /etc/nginx/nginx.conf.backup /etc/nginx/nginx.conf
    exit 1
fi
"@

# Clean up
Remove-Item "nginx_temp.conf" -ErrorAction SilentlyContinue

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Access your app:" -ForegroundColor Cyan
    Write-Host "  Frontend: http://$VpsIp" -ForegroundColor White
    Write-Host "  API: http://$VpsIp/api/health" -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 Test commands:" -ForegroundColor Cyan
    Write-Host "  curl http://$VpsIp" -ForegroundColor White
    Write-Host "  curl http://$VpsIp/api/health" -ForegroundColor White
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
}
