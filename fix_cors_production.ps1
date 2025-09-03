# Fix CORS and Domain Issues for Production
param(
    [string]$VpsIp = "157.10.199.22",
    [string]$VpsUser = "root"
)

Write-Host "🔧 Fixing CORS and Domain Issues for Production..." -ForegroundColor Green

# Step 1: Upload updated config.py
Write-Host "📤 Uploading updated config.py..." -ForegroundColor Yellow
scp backend/app/core/config.py ${VpsUser}@${VpsIp}:/var/www/hotel-backend/app/core/config.py

# Step 2: Upload updated nginx.conf
Write-Host "📤 Uploading updated nginx.conf..." -ForegroundColor Yellow
scp backend/nginx.conf ${VpsUser}@${VpsIp}:/var/www/hotel-backend/nginx.conf

# Step 3: Restart services on VPS
Write-Host "🔄 Restarting services on VPS..." -ForegroundColor Yellow
ssh ${VpsUser}@${VpsIp} "
cd /var/www/hotel-backend
echo '🔄 Restarting FastAPI service...'
sudo systemctl restart fastapi-zalomini
sleep 3

echo '🔄 Updating nginx config...'
sudo cp nginx.conf /etc/nginx/conf.d/zalominiapp.conf
sudo nginx -t
if [ \$? -eq 0 ]; then
    sudo systemctl reload nginx
    echo '✅ Nginx reloaded successfully!'
else
    echo '❌ Nginx config test failed!'
    exit 1
fi

echo '📊 Checking service status...'
sudo systemctl status fastapi-zalomini --no-pager -l
sudo systemctl status nginx --no-pager -l
"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Services updated successfully!" -ForegroundColor Green
    Write-Host "🌐 Test your site: https://zalominiapp.vtlink.vn" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to restart services!" -ForegroundColor Red
}
