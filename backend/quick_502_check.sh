#!/bin/bash
# Quick 502 Diagnosis
echo "🔍 QUICK 502 DIAGNOSIS"
echo "====================="

echo "1. Checking FastAPI service:"
sudo systemctl is-active hotel-backend && echo "✅ Service active" || echo "❌ Service inactive"

echo ""
echo "2. Checking port 8000:"
sudo netstat -tlnp | grep :8000 && echo "✅ Port 8000 in use" || echo "❌ Nothing on port 8000"

echo ""
echo "3. Testing direct FastAPI:"
timeout 5 curl -s http://127.0.0.1:8000/health && echo "✅ FastAPI responds" || echo "❌ FastAPI not responding"

echo ""
echo "4. Last 10 FastAPI log lines:"
sudo journalctl -u hotel-backend -n 10 --no-pager | tail -5

echo ""
echo "5. Checking if Python/uvicorn processes exist:"
ps aux | grep -E "(uvicorn|fastapi|python)" | grep -v grep

echo ""
echo "📋 QUICK FIXES TO TRY:"
echo "• Restart service: sudo systemctl restart hotel-backend"
echo "• Check logs: sudo journalctl -u hotel-backend -f"
echo "• Manual test: cd /var/www/hotel-backend/backend && source venv/bin/activate && python -c 'from app.main import app; print(\"App OK\")'"
