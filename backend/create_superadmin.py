#!/usr/bin/env python3
"""
Script tạo tài khoản Super Admin cho hệ thống Hotel SaaS
Chạy trên VPS production
"""

import sys
import os
import hashlib
from datetime import datetime
import pymysql
from getpass import getpass

# Database configuration cho VPS
DB_CONFIG = {
    'host': 'localhost',
    'user': 'da_admin',
    'password': 'C8tZ5WfPAxAPfBso',
    'database': 'bookingservicesiovn_zalominidb',
    'charset': 'utf8mb4'
}

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_superadmin():
    """Tạo tài khoản Super Admin"""
    
    print("🚀 HOTEL SAAS - TẠO TÀI KHOẢN SUPER ADMIN")
    print("=" * 50)
    
    # Nhập thông tin admin
    username = input("Username: ").strip()
    if not username:
        print("❌ Username không được để trống!")
        return False
        
    email = input("Email: ").strip()
    if not email:
        print("❌ Email không được để trống!")
        return False
    
    # Nhập password
    password = getpass("Password: ")
    if len(password) < 6:
        print("❌ Password phải có ít nhất 6 ký tự!")
        return False
        
    password_confirm = getpass("Confirm Password: ")
    if password != password_confirm:
        print("❌ Password xác nhận không khớp!")
        return False
    
    # Hash password
    hashed_password = hash_password(password)
    
    try:
        # Kết nối database
        print("\n📊 Đang kết nối database...")
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        # Kiểm tra username đã tồn tại
        cursor.execute("SELECT id FROM tbl_admin_users WHERE username = %s AND deleted = 0", (username,))
        if cursor.fetchone():
            print(f"❌ Username '{username}' đã tồn tại!")
            return False
        
        # Tạo superadmin
        insert_query = """
        INSERT INTO tbl_admin_users (
            tenant_id, username, hashed_password, email, role, status,
            created_at, updated_at, created_by
        ) VALUES (
            NULL, %s, %s, %s, 'super_admin', 'active',
            %s, %s, 'system'
        )
        """
        
        current_time = datetime.now()
        cursor.execute(insert_query, (username, hashed_password, email, current_time, current_time))
        connection.commit()
        
        print("✅ Tạo Super Admin thành công!")
        print(f"   • Username: {username}")
        print(f"   • Email: {email}")
        print(f"   • Role: super_admin")
        print(f"   • Created: {current_time}")
        
        # Hiển thị thông tin đăng nhập
        print("\n🔑 THÔNG TIN ĐĂNG NHẬP:")
        print(f"   • URL: http://157.10.199.22/")
        print(f"   • Username: {username}")
        print(f"   • Password: [đã nhập]")
        print(f"   • Role: Super Admin")
        
        return True
        
    except pymysql.Error as e:
        print(f"❌ Lỗi database: {e}")
        return False
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False
    finally:
        if 'connection' in locals():
            connection.close()

def create_demo_accounts():
    """Tạo các tài khoản demo cho presentation"""
    
    demo_accounts = [
        {
            'username': 'superadmin',
            'email': 'admin@hotel-saas.com',
            'password': 'admin123',
            'role': 'super_admin',
            'tenant_id': None
        },
        {
            'username': 'admin_grand',
            'email': 'admin@grandhotel.com', 
            'password': 'admin123',
            'role': 'hotel_admin',
            'tenant_id': 1
        },
        {
            'username': 'admin_beach',
            'email': 'admin@beachresort.com',
            'password': 'admin123', 
            'role': 'hotel_admin',
            'tenant_id': 2
        }
    ]
    
    try:
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("\n🎯 TẠO TÀI KHOẢN DEMO CHO PRESENTATION")
        print("=" * 50)
        
        for account in demo_accounts:
            # Kiểm tra đã tồn tại
            cursor.execute("SELECT id FROM tbl_admin_users WHERE username = %s AND deleted = 0", 
                         (account['username'],))
            if cursor.fetchone():
                print(f"⚠️  {account['username']} đã tồn tại, bỏ qua...")
                continue
            
            # Tạo tài khoản
            hashed_password = hash_password(account['password'])
            insert_query = """
            INSERT INTO tbl_admin_users (
                tenant_id, username, hashed_password, email, role, status,
                created_at, updated_at, created_by
            ) VALUES (
                %s, %s, %s, %s, %s, 'active', %s, %s, 'demo_script'
            )
            """
            
            current_time = datetime.now()
            cursor.execute(insert_query, (
                account['tenant_id'], account['username'], hashed_password,
                account['email'], account['role'], current_time, current_time
            ))
            
            print(f"✅ Tạo thành công: {account['username']} ({account['role']})")
        
        connection.commit()
        
        print("\n🔑 THÔNG TIN TÀI KHOẢN DEMO:")
        print("=" * 50)
        for account in demo_accounts:
            tenant_name = "Toàn hệ thống" if account['tenant_id'] is None else f"Tenant {account['tenant_id']}"
            print(f"• {account['username']} / {account['password']} - {account['role']} ({tenant_name})")
        
        print(f"\n🌐 URL đăng nhập: http://157.10.199.22/")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi tạo demo accounts: {e}")
        return False
    finally:
        if 'connection' in locals():
            connection.close()

def main():
    if len(sys.argv) > 1 and sys.argv[1] == 'demo':
        create_demo_accounts()
    else:
        create_superadmin()

if __name__ == "__main__":
    main()
