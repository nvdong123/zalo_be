#!/usr/bin/env python3
"""
Script to add missing booking_url column to tbl_rooms table
"""
import pymysql
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def add_booking_url_column():
    """Add booking_url column to tbl_rooms if it doesn't exist"""
    
    # Database connection parameters
    connection = pymysql.connect(
        host=os.getenv('MYSQL_SERVER', 'localhost'),
        user=os.getenv('MYSQL_USER', 'root'),
        password=os.getenv('MYSQL_PASSWORD', ''),
        database=os.getenv('MYSQL_DB', 'zalo_miniapp'),
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    
    try:
        with connection.cursor() as cursor:
            # Check if booking_url column exists
            cursor.execute('DESCRIBE tbl_rooms')
            columns = [row['Field'] for row in cursor.fetchall()]
            print(f'Existing columns in tbl_rooms: {columns}')
            
            if 'booking_url' not in columns:
                print('Adding booking_url column...')
                cursor.execute('ALTER TABLE tbl_rooms ADD COLUMN booking_url VARCHAR(255)')
                connection.commit()
                print('✅ booking_url column added successfully!')
            else:
                print('✅ booking_url column already exists')
                
            # Verify the column was added
            cursor.execute('DESCRIBE tbl_rooms')
            columns_after = [row['Field'] for row in cursor.fetchall()]
            print(f'Columns after update: {columns_after}')
            
    except Exception as e:
        print(f'❌ Error: {e}')
        return False
    finally:
        connection.close()
    
    return True

if __name__ == '__main__':
    print('🔧 Fixing database schema...')
    success = add_booking_url_column()
    if success:
        print('✅ Database schema fixed successfully!')
    else:
        print('❌ Failed to fix database schema')
