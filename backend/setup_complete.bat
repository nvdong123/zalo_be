@echo off
echo 🏨 Hotel SaaS - Complete MySQL Setup
echo ===================================

echo.
echo 📋 Step 1: Update MySQL password
echo Edit backend\app\core\config_mysql_local.py
echo Change: MYSQL_PASSWORD = "" to your MySQL password
echo.

echo 📋 Step 2: Create database with Python script (Recommended)
echo cd backend
echo python create_mysql_data_python.py
echo.

echo OR use SQL script:
echo mysql -u root -p ^< create_mysql_data.sql
echo.

echo 📋 Step 3: Start backend
echo cd backend
echo run_mysql_backend.bat
echo.

echo 📋 Step 4: Update frontend to use real API
echo In fe\.env or frontend\.env:
echo VITE_API_BASE_URL=http://localhost:8888
echo.

echo 🔑 Default Login Credentials:
echo Super Admin: superadmin / admin123
echo Hotel Admins: admin_grand, admin_beach, admin_mountain / admin123
echo.

echo 🎯 Ready to use real MySQL data instead of mocks!
pause
