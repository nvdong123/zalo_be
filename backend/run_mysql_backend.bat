@echo off
echo 🚀 Starting Hotel SaaS Backend with MySQL...

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/upgrade dependencies
echo 📚 Installing dependencies...
pip install -r app\requirements.txt
pip install pymysql passlib[bcrypt] python-jose[cryptography]

REM Check MySQL connection
echo 🗄️ Checking MySQL connection...
python -c "import pymysql; print('✅ pymysql available')" 2>nul || (
    echo ❌ pymysql not found, installing...
    pip install pymysql
)

REM Run the backend
echo 🎯 Starting FastAPI backend on http://localhost:8888...
cd app
python -m uvicorn main_mysql:app --host 0.0.0.0 --port 8888 --reload

pause
