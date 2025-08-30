#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import pymysql
from datetime import datetime, timedelta

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'zalo_user',
    'password': 'zalo123',
    'database': 'zalo_hotel_booking'
}

def create_test_data():
    """Create minimal test data for booking management"""
    try:
        # Connect to database
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("Creating test data...")
        
        # 1. Ensure we have a customer
        cursor.execute("""
            INSERT IGNORE INTO tbl_customers 
            (id, tenant_id, name, phone, email, created_at, deleted) 
            VALUES (1, 1, 'John Doe', '123456789', 'john@example.com', NOW(), 0)
        """)
        
        # 2. Ensure we have a room
        cursor.execute("""
            INSERT IGNORE INTO tbl_rooms 
            (id, tenant_id, room_type, room_name, description, price, capacity_adults, created_at, deleted) 
            VALUES (1, 1, 'Standard', 'Room 101', 'Standard room with basic amenities', 100.00, 2, NOW(), 0)
        """)
        
        # 3. Create a booking request
        tomorrow = datetime.now() + timedelta(days=1)
        day_after = tomorrow + timedelta(days=1)
        
        cursor.execute("""
            INSERT IGNORE INTO tbl_booking_requests 
            (id, tenant_id, customer_id, room_id, mobile_number, check_in_date, check_out_date, 
             status, note, created_at, deleted) 
            VALUES (1, 1, 1, 1, '123456789', %s, %s, 'pending', 'Test booking', NOW(), 0)
        """, (tomorrow.strftime('%Y-%m-%d'), day_after.strftime('%Y-%m-%d')))
        
        conn.commit()
        print("✓ Test data created successfully!")
        
        # Verify data
        cursor.execute("SELECT COUNT(*) FROM tbl_booking_requests WHERE deleted = 0")
        booking_count = cursor.fetchone()[0]
        print(f"✓ Found {booking_count} booking(s) in database")
        
    except pymysql.Error as e:
        print(f"❌ Database error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    create_test_data()
