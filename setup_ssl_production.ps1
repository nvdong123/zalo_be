# Setup SSL for zalominiapp.vtlink.vn
param(
    [string]$VpsIp = "157.10.199.22", 
    [string]$VpsUser = "root"
)

Write-Host "🔒 Setting up SSL for zalominiapp.vtlink.vn..." -ForegroundColor Green

# Upload SSL setup script
Write-Host "📤 Uploading SSL setup script..." -ForegroundColor Yellow
scp backend/setup_ssl_zalominiapp.sh ${VpsUser}@${VpsIp}:/root/setup_ssl_zalominiapp.sh

# Run SSL setup on VPS
Write-Host "🔧 Running SSL setup on VPS..." -ForegroundColor Yellow
ssh ${VpsUser}@${VpsIp} "
cd /root
chmod +x setup_ssl_zalominiapp.sh
./setup_ssl_zalominiapp.sh
"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SSL setup completed!" -ForegroundColor Green
    Write-Host "🌐 Your site should now be available at: https://zalominiapp.vtlink.vn" -ForegroundColor Cyan
} else {
    Write-Host "❌ SSL setup failed!" -ForegroundColor Red
    Write-Host "💡 You may need to:" -ForegroundColor Yellow
    Write-Host "   1. Ensure domain DNS points to your VPS IP" -ForegroundColor Yellow
    Write-Host "   2. Check firewall allows ports 80 and 443" -ForegroundColor Yellow
    Write-Host "   3. Manually run SSL setup on VPS" -ForegroundColor Yellow
}
