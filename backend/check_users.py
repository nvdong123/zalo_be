#!/usr/bin/env python3
import pymysql

try:
    connection = pymysql.connect(
        host='localhost',
        user='da_admin',
        password='C8tZ5WfPAxAPfBso',
        database='bookingservicesiovn_zalominidb',
        charset='utf8mb4'
    )
    
    cursor = connection.cursor()
    cursor.execute('SELECT id, username, role, status FROM tbl_admin_users WHERE deleted = 0 LIMIT 10;')
    results = cursor.fetchall()
    
    print("🔑 ADMIN USERS IN DATABASE:")
    print("=" * 50)
    for row in results:
        print(f"ID: {row[0]:2d} | Username: {row[1]:15s} | Role: {row[2]:12s} | Status: {row[3]}")
    
    print(f"\n📊 Total: {len(results)} users found")
    connection.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
