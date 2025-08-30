# ========================================
# 🚀 SAFE DEPLOYMENT UPLOAD SCRIPT (PowerShell)
# ========================================
# Usage: .\safe_upload.ps1 -VpsHost "user@vps-ip" -RemotePath "/remote/path"

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsHost,
    
    [Parameter(Mandatory=$true)]
    [string]$RemotePath
)

Write-Host "🚀 Starting safe deployment upload..." -ForegroundColor Blue
Write-Host "VPS: $VpsHost" -ForegroundColor Yellow
Write-Host "Remote Path: $RemotePath" -ForegroundColor Yellow

# Files to exclude
$ExcludePatterns = @(
    "venv_py311\*",
    ".venv\*",
    "venv\*",
    "node_modules\*",
    "fe\node_modules\*",
    "__pycache__\*",
    "*.pyc",
    "*.log", 
    "logs\*",
    ".git\*",
    ".vscode\*",
    ".idea\*",
    "*_backup.*",
    "*_old.*", 
    "*_Real.*",
    "*_test.*",
    "*.tmp",
    "*.bak",
    "*.db",
    "*.sqlite",
    "local_test.db",
    ".env",
    ".env.local",
    "uploads\*",
    "backend\uploads\tenant_*",
    "dist\*",
    "fe\dist\*",
    ".cache\*",
    "DEPLOYMENT_READY.md",
    "cleanup_for_deploy.ps1",
    ".deployignore",
    "*.zip",
    "*.tar.gz"
)

Write-Host "📁 Preparing files for upload (excluding development files)..." -ForegroundColor Green

# Create temporary directory for clean files
$TempDir = "temp_deploy_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$null = New-Item -ItemType Directory -Path $TempDir

try {
    # Copy files excluding patterns
    Write-Host "📋 Copying production files..." -ForegroundColor Cyan
    
    # Get all files and filter out excluded ones
    $AllFiles = Get-ChildItem -Recurse -File | Where-Object {
        $file = $_
        $shouldExclude = $false
        
        foreach ($pattern in $ExcludePatterns) {
            if ($file.FullName -like "*$pattern*") {
                $shouldExclude = $true
                break
            }
        }
        
        return -not $shouldExclude
    }
    
    # Copy filtered files maintaining directory structure
    foreach ($file in $AllFiles) {
        $relativePath = $file.FullName.Substring((Get-Location).Path.Length + 1)
        $targetPath = Join-Path $TempDir $relativePath
        $targetDir = Split-Path $targetPath -Parent
        
        if (!(Test-Path $targetDir)) {
            $null = New-Item -ItemType Directory -Path $targetDir -Force
        }
        
        Copy-Item $file.FullName $targetPath
    }
    
    Write-Host "✅ Files prepared in: $TempDir" -ForegroundColor Green
    Write-Host "📊 Total files to upload: $($AllFiles.Count)" -ForegroundColor Cyan
    
    # Show summary of what's being uploaded
    Write-Host "`n📦 Upload includes:" -ForegroundColor Yellow
    Write-Host "• Backend API (FastAPI + MySQL)" -ForegroundColor White
    Write-Host "• Frontend (React + TypeScript)" -ForegroundColor White  
    Write-Host "• Database schema & scripts" -ForegroundColor White
    Write-Host "• Deployment & SSL scripts" -ForegroundColor White
    Write-Host "• Nginx configuration" -ForegroundColor White
    
    Write-Host "`n🚫 Excluded:" -ForegroundColor Red
    Write-Host "• Virtual environments (venv_py311/)" -ForegroundColor Gray
    Write-Host "• Node modules (node_modules/)" -ForegroundColor Gray
    Write-Host "• Development files (*_backup, *_test)" -ForegroundColor Gray
    Write-Host "• Local databases (*.db, *.sqlite)" -ForegroundColor Gray
    Write-Host "• Log files and cache" -ForegroundColor Gray
    
    $confirm = Read-Host "`n❓ Proceed with upload? (y/N)"
    
    if ($confirm -eq 'y' -or $confirm -eq 'Y') {
        Write-Host "🔄 Uploading to VPS using SCP..." -ForegroundColor Blue
        
        # Use SCP to upload (requires OpenSSH or PuTTY)
        $scpCommand = "scp -r `"$TempDir\*`" $VpsHost`:$RemotePath"
        Write-Host "Command: $scpCommand" -ForegroundColor Gray
        
        Invoke-Expression $scpCommand
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Upload completed successfully!" -ForegroundColor Green
            
            Write-Host "`n🔧 Setting permissions on VPS..." -ForegroundColor Blue
            $sshCommand = "ssh $VpsHost `"cd $RemotePath && chmod +x backend/*.sh`""
            Invoke-Expression $sshCommand
            
            Write-Host "`n📋 Next steps:" -ForegroundColor Green
            Write-Host "1. SSH to VPS: ssh $VpsHost" -ForegroundColor Yellow
            Write-Host "2. Go to project: cd $RemotePath" -ForegroundColor Yellow
            Write-Host "3. Run deployment: ./backend/deploy_all.sh" -ForegroundColor Yellow
            Write-Host "4. Setup SSL: ./backend/setup_ssl_zalominiapp.sh" -ForegroundColor Yellow
            
        } else {
            Write-Host "❌ Upload failed!" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Upload cancelled by user" -ForegroundColor Yellow
    }
    
} finally {
    # Clean up temp directory
    if (Test-Path $TempDir) {
        Remove-Item $TempDir -Recurse -Force
        Write-Host "🧹 Cleaned up temporary files" -ForegroundColor Gray
    }
}

Write-Host "🎉 Deployment preparation completed!" -ForegroundColor Green
