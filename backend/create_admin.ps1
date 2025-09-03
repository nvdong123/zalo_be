# PowerShell Script tạo Super Admin trên VPS
param(
    [switch]$Demo,
    [string]$VpsIp = "157.10.199.22"
)

Write-Host "🚀 Tạo Super Admin cho Hotel SaaS" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Upload script
Write-Host "📤 Uploading script to VPS..." -ForegroundColor Yellow
scp "create_superadmin.py" "root@${VpsIp}:/tmp/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    exit 1
}

# Chạy script
Write-Host "🔧 Running on VPS..." -ForegroundColor Yellow

if ($Demo) {
    # Tạo tài khoản demo
    ssh "root@$VpsIp" @"
cd /tmp
pip3 install pymysql > /dev/null 2>&1
python3 create_superadmin.py demo
rm create_superadmin.py
"@
} else {
    # Tạo admin thủ công
    ssh "root@$VpsIp" @"
cd /tmp
pip3 install pymysql > /dev/null 2>&1
python3 create_superadmin.py
rm create_superadmin.py
"@
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Hoàn thành!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Truy cập admin panel: http://$VpsIp" -ForegroundColor Cyan
} else {
    Write-Host "❌ Có lỗi xảy ra!" -ForegroundColor Red
}
