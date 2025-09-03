#!/usr/bin/env python3
import pymysql

try:
    # Kết nối database với user đúng như API
    connection = pymysql.connect(
        host='localhost',
        user='hotel_app_user',
        password='HotelApp2025!@#Secure',
        database='bookingservicesiovn_zalominidb',
        charset='utf8mb4'
    )
    
    cursor = connection.cursor()
    
    # Kiểm tra admin users
    print("📋 KIỂM TRA ADMIN USERS TRONG DATABASE")
    print("=" * 50)
    
    cursor.execute("SELECT COUNT(*) FROM tbl_admin_users WHERE deleted = 0")
    count = cursor.fetchone()[0]
    print(f"Tổng số admin users: {count}")
    
    if count > 0:
        cursor.execute("""
            SELECT id, username, role, status, tenant_id, created_at 
            FROM tbl_admin_users 
            WHERE deleted = 0 
            ORDER BY id
        """)
        
        results = cursor.fetchall()
        print("\n👤 DANH SÁCH ADMIN USERS:")
        print("-" * 80)
        
        for row in results:
            print(f"ID: {row[0]:<3} | Username: {row[1]:<15} | Role: {row[2]:<12} | Status: {row[3]:<8} | Tenant: {row[4]:<3} | Created: {row[5]}")
    else:
        print("❌ KHÔNG CÓ ADMIN USERS NÀO TRONG DATABASE!")
        
    # Kiểm tra tenants
    cursor.execute("SELECT COUNT(*) FROM tbl_tenants WHERE deleted = 0")
    tenant_count = cursor.fetchone()[0]
    print(f"\n🏢 Tổng số tenants: {tenant_count}")
    
    if tenant_count > 0:
        cursor.execute("SELECT id, name, status FROM tbl_tenants WHERE deleted = 0")
        tenants = cursor.fetchall()
        print("\n🏢 DANH SÁCH TENANTS:")
        for tenant in tenants:
            print(f"ID: {tenant[0]} | Name: {tenant[1]} | Status: {tenant[2]}")
    
    connection.close()
    print("\n✅ Kiểm tra hoàn tất!")
    
except Exception as e:
    print(f"❌ Lỗi kết nối database: {e}")
