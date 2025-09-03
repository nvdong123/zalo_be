#!/usr/bin/env python3
import sys
import os
sys.path.append('/var/www/hotel-backend/backend')

try:
    from app.core.config import settings
    print("🔍 API DATABASE CONFIG:")
    print("=" * 50)
    print(f"DB Host: {settings.DB_HOST}")
    print(f"DB User: {settings.DB_USER}")
    print(f"DB Name: {settings.DB_NAME}")
    print(f"DB Port: {settings.DB_PORT}")
    
    # Test connection với config từ API
    import pymysql
    connection = pymysql.connect(
        host=settings.DB_HOST,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        database=settings.DB_NAME,
        charset='utf8mb4'
    )
    
    cursor = connection.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM tbl_admin_users WHERE deleted = 0")
    count = cursor.fetchone()[0]
    print(f"\n📊 Admin users trong database: {count}")
    
    if count > 0:
        cursor.execute("SELECT id, username, role, LEFT(hashed_password, 20) as pwd_preview FROM tbl_admin_users WHERE deleted = 0 LIMIT 3")
        users = cursor.fetchall()
        print("\n👤 ADMIN USERS:")
        for user in users:
            print(f"ID: {user[0]} | Username: {user[1]} | Role: {user[2]} | Password Hash: {user[3]}...")
    
    # Test tenant count
    cursor.execute("SELECT COUNT(*) as count FROM tbl_tenants WHERE deleted = 0")
    tenant_count = cursor.fetchone()[0]
    print(f"\n🏢 Tenants trong database: {tenant_count}")
    
    connection.close()
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
