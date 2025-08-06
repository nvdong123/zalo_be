@echo off
REM Upload and Deploy Script for Windows
REM Deploy Hotel Management Backend to bookingservices.io.vn

echo.
echo ========================================
echo   DEPLOY TO bookingservices.io.vn
echo ========================================
echo.

REM Configuration
set VPS_IP=157.10.199.22
set VPS_USER=root
set VPS_PASS=NA73eS@UHtPq
set DOMAIN=bookingservices.io.vn

echo Target Configuration:
echo   VPS IP: %VPS_IP%
echo   User: %VPS_USER%
echo   Domain: %DOMAIN%
echo.

REM Check if backend directory exists
if not exist "backend" (
    echo ERROR: Backend directory not found!
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo Step 1: Preparing deployment package...
echo.

REM Create deployment package using tar (if available) or PowerShell
where tar >nul 2>nul
if %errorlevel% == 0 (
    echo Using tar to create package...
    tar -czf hotel-backend-deploy.tar.gz backend/
) else (
    echo Using PowerShell to create package...
    powershell -command "Compress-Archive -Path 'backend' -DestinationPath 'hotel-backend-deploy.zip' -Force"
)

echo ✓ Deployment package created
echo.

echo Step 2: Uploading to VPS...
echo.

REM Check if we have SCP available
where scp >nul 2>nul
if %errorlevel% == 0 (
    echo Using SCP to upload...
    scp -o StrictHostKeyChecking=no hotel-backend-deploy.tar.gz %VPS_USER%@%VPS_IP%:/tmp/
    if %errorlevel% == 0 (
        echo ✓ Files uploaded successfully
    ) else (
        echo ✗ Upload failed
        goto :error
    )
) else (
    echo SCP not found. Please use one of these methods:
    echo.
    echo METHOD 1: Install Git for Windows (includes SCP)
    echo   Download from: https://git-scm.com/download/win
    echo.
    echo METHOD 2: Use WinSCP
    echo   1. Download WinSCP from: https://winscp.net/
    echo   2. Connect to: %VPS_IP%
    echo   3. User: %VPS_USER%
    echo   4. Password: %VPS_PASS%
    echo   5. Upload 'backend' folder to /tmp/
    echo.
    echo METHOD 3: Use PowerShell SSH (Windows 10/11)
    echo   Run in PowerShell:
    echo   scp -r backend/ %VPS_USER%@%VPS_IP%:/tmp/
    echo.
    pause
    goto :manual
)

echo.
echo Step 3: Connecting to VPS and deploying...
echo.

REM Check if we have SSH available
where ssh >nul 2>nul
if %errorlevel% == 0 (
    echo Connecting via SSH...
    ssh -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "cd /tmp && tar -xzf hotel-backend-deploy.tar.gz && cd backend && chmod +x deploy_bookingservices.sh && ./deploy_bookingservices.sh"
    if %errorlevel% == 0 (
        echo ✓ Deployment completed successfully!
    ) else (
        echo ✗ Deployment may have issues
        goto :manual
    )
) else (
    echo SSH not found. Please connect manually using PuTTY:
    goto :manual
)

goto :success

:manual
echo.
echo ========================================
echo   MANUAL DEPLOYMENT STEPS
echo ========================================
echo.
echo 1. Connect to VPS using PuTTY:
echo    Host: %VPS_IP%
echo    User: %VPS_USER%
echo    Password: %VPS_PASS%
echo.
echo 2. Run these commands on VPS:
echo    cd /tmp
echo    tar -xzf hotel-backend-deploy.tar.gz  (or unzip hotel-backend-deploy.zip)
echo    cd backend
echo    chmod +x deploy_bookingservices.sh
echo    ./deploy_bookingservices.sh
echo.
goto :end

:success
echo.
echo ========================================
echo   DEPLOYMENT COMPLETED!
echo ========================================
echo.
echo Your application is now available at:
echo   • Website: https://%DOMAIN%
echo   • API: https://%DOMAIN%/api/v1/
echo   • Documentation: https://%DOMAIN%/docs
echo   • Health check: https://%DOMAIN%/health
echo.
echo To check status:
echo   ssh %VPS_USER%@%VPS_IP%
echo   sudo systemctl status hotel-backend
echo.
goto :end

:error
echo.
echo ========================================
echo   DEPLOYMENT FAILED
echo ========================================
echo.
echo Please check your connection and try again.
echo You can also deploy manually using the steps above.
echo.

:end
echo.
echo Cleaning up temporary files...
if exist hotel-backend-deploy.tar.gz del hotel-backend-deploy.tar.gz
if exist hotel-backend-deploy.zip del hotel-backend-deploy.zip

echo.
echo Press any key to exit...
pause >nul
