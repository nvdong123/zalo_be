# Fix CORS and deployment issues
param(
    [string]$VpsIp = "157.10.199.22",
    [string]$VpsUser = "root"
)

Write-Host "🔧 Fixing CORS and deployment issues..." -ForegroundColor Green

# Step 1: Commit current changes
Write-Host "📝 Committing changes..." -ForegroundColor Yellow
git add .
git commit -m "Fix CORS and API URLs for production deployment"
git push

# Step 2: Upload updated backend files
Write-Host "📤 Uploading backend config..." -ForegroundColor Yellow
scp backend/app/core/config.py ${VpsUser}@${VpsIp}:/var/www/hotel-backend/app/core/config.py
scp backend/nginx.conf ${VpsUser}@${VpsIp}:/var/www/hotel-backend/nginx.conf

# Step 3: Build frontend with production env
Write-Host "🏗️ Building frontend for production..." -ForegroundColor Yellow
cd fe
npm run build:prod
cd ..

if (!(Test-Path "fe/dist")) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

# Step 4: Upload frontend
Write-Host "📤 Uploading frontend..." -ForegroundColor Yellow
scp -r fe/dist/* ${VpsUser}@${VpsIp}:/var/www/zalominiapp/

# Step 5: Restart services on VPS
Write-Host "🔄 Restarting services on VPS..." -ForegroundColor Yellow
ssh ${VpsUser}@${VpsIp} "
cd /var/www/hotel-backend

echo '🔄 Restarting FastAPI service...'
sudo systemctl restart fastapi-zalomini

echo '🔄 Updating nginx config...'
sudo cp nginx.conf /etc/nginx/conf.d/zalominiapp.conf

echo '🧪 Testing nginx config...'
sudo nginx -t
if [ \$? -eq 0 ]; then
    sudo systemctl reload nginx
    echo '✅ Nginx reloaded successfully!'
else
    echo '❌ Nginx config test failed!'
    exit 1
fi

echo '📊 Checking service status...'
sudo systemctl status fastapi-zalomini --no-pager -l | head -20
sudo systemctl status nginx --no-pager -l | head -10
"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Test your site: https://zalominiapp.vtlink.vn" -ForegroundColor Cyan
    Write-Host "📊 Dashboard: https://zalominiapp.vtlink.vn/dashboard" -ForegroundColor Cyan
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
}
