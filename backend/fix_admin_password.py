#!/usr/bin/env python3
import pymysql
from passlib.context import CryptContext

# API đang sử dụng config này
DB_CONFIG = {
    'host': 'localhost',
    'user': 'da_admin',
    'password': 'C8tZ5WfPAxAPfBso',
    'database': 'bookingservicesiovn_zalominidb',
    'charset': 'utf8mb4'
}

# Password context như API sử dụng
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

try:
    print("🔍 KIỂM TRA DATABASE MÀ API ĐANG SỬ DỤNG")
    print("=" * 60)
    
    connection = pymysql.connect(**DB_CONFIG)
    cursor = connection.cursor()
    
    # Kiểm tra admin users
    cursor.execute("SELECT COUNT(*) FROM tbl_admin_users WHERE deleted = 0")
    count = cursor.fetchone()[0]
    print(f"📊 Tổng số admin users: {count}")
    
    if count > 0:
        cursor.execute("SELECT id, username, role, hashed_password FROM tbl_admin_users WHERE deleted = 0")
        users = cursor.fetchall()
        print("\n👤 ADMIN USERS HIỆN TẠI:")
        print("-" * 80)
        for user in users:
            password_type = "bcrypt" if user[3].startswith('$2b$') else "sha256"
            print(f"ID: {user[0]:<3} | Username: {user[1]:<15} | Role: {user[2]:<12} | Password: {password_type}")
    
    print(f"\n🔧 TẠO LẠI ADMIN USERS VỚI BCRYPT PASSWORD")
    print("-" * 60)
    
    # Xóa tất cả admin users (cả deleted và không deleted)
    cursor.execute("DELETE FROM tbl_admin_users")
    print("🗑️ Đã xóa tất cả admin users cũ")
    
    # Tạo admin users mới với bcrypt
    admin_users = [
        {'username': 'superadmin', 'password': 'admin123', 'role': 'super_admin', 'tenant_id': None},
        {'username': 'admin_grand', 'password': 'admin123', 'role': 'hotel_admin', 'tenant_id': 1},
        {'username': 'admin_beach', 'password': 'admin123', 'role': 'hotel_admin', 'tenant_id': 2}
    ]
    
    for admin in admin_users:
        # Hash password với bcrypt như API
        hashed_password = pwd_context.hash(admin['password'])
        
        cursor.execute("""
            INSERT INTO tbl_admin_users 
            (tenant_id, username, hashed_password, email, role, status, created_at, updated_at, created_by, deleted)
            VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW(), %s, %s)
        """, (
            admin['tenant_id'], admin['username'], hashed_password, 
            f"{admin['username']}@example.com", admin['role'], 'active', 'fix_script', 0
        ))
        
        print(f"✅ Created: {admin['username']} ({admin['role']}) - Password: {admin['password']}")
    
    connection.commit()
    connection.close()
    
    print(f"\n🎯 HOÀN TẤT! CÁC TÀI KHOẢN SẴN SÀNG:")
    print("=" * 60)
    print("• superadmin / admin123 (Super Admin)")
    print("• admin_grand / admin123 (Hotel Admin)")  
    print("• admin_beach / admin123 (Hotel Admin)")
    print(f"\n🌐 Test tại: https://zalominiapp.vtlink.vn/api/v1/auth/login")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
