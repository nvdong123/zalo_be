# Check VPS structure
param(
    [string]$VpsIp = "157.10.199.22",
    [string]$VpsUser = "root"
)

Write-Host "🔍 Checking VPS structure..." -ForegroundColor Green

ssh ${VpsUser}@${VpsIp} "
echo '=== Current directory ==='
pwd
echo ''

echo '=== /var/www contents ==='
ls -la /var/www/
echo ''

echo '=== /root contents ==='
ls -la /root/
echo ''

echo '=== Systemd services ==='
sudo systemctl list-units --type=service | grep -E '(fastapi|uvicorn|hotel|zalo)'
echo ''

echo '=== Nginx sites ==='
ls -la /etc/nginx/conf.d/ | grep -E '(zalo|hotel)'
echo ''

echo '=== Active processes ==='
ps aux | grep -E '(uvicorn|python|fastapi)' | grep -v grep
"
