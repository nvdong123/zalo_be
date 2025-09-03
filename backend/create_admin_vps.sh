#!/bin/bash

# Script tạo Super Admin trên VPS
# Chạy: bash create_admin_vps.sh

echo "🚀 Tạo Super Admin cho Hotel SaaS trên VPS"
echo "=========================================="

# Upload script lên VPS
echo "📤 Uploading script to VPS..."
scp create_superadmin.py root@157.10.199.22:/tmp/

# Chạy script trên VPS
echo "🔧 Running script on VPS..."
ssh root@157.10.199.22 << 'EOF'
cd /tmp

# Install pymysql nếu chưa có
pip3 install pymysql

# Chạy script tạo admin
echo "Chọn option:"
echo "1. Tạo Super Admin mới (thủ công)"
echo "2. Tạo tài khoản Demo cho presentation"
read -p "Nhập lựa chọn (1 hoặc 2): " choice

if [ "$choice" = "1" ]; then
    python3 create_superadmin.py
elif [ "$choice" = "2" ]; then
    python3 create_superadmin.py demo
else
    echo "❌ Lựa chọn không hợp lệ!"
    exit 1
fi

# Clean up
rm create_superadmin.py

EOF

echo "✅ Hoàn thành!"
