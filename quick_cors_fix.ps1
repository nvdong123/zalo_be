# Quick CORS fix
param(
    [string]$VpsIp = "157.10.199.22",
    [string]$VpsUser = "root"
)

Write-Host "🔧 Quick CORS fix for zalominiapp.vtlink.vn..." -ForegroundColor Green

# Upload config.py with updated CORS
Write-Host "📤 Uploading updated config.py..." -ForegroundColor Yellow
scp backend/app/core/config.py ${VpsUser}@${VpsIp}:/var/www/hotel-backend/backend/app/core/config.py

# Restart FastAPI service
Write-Host "🔄 Restarting FastAPI service..." -ForegroundColor Yellow
ssh ${VpsUser}@${VpsIp} "
echo 'Restarting hotel-backend service...'
sudo systemctl restart hotel-backend
sleep 2
sudo systemctl status hotel-backend --no-pager -l | head -10
"

Write-Host "✅ CORS fix applied!" -ForegroundColor Green
Write-Host "🌐 Test: https://zalominiapp.vtlink.vn" -ForegroundColor Cyan
