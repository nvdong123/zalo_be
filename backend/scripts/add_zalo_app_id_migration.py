#!/usr/bin/env python3
"""
Migration script to add zalo_app_id column to tbl_hotel_brands table
Run this script to update the database schema
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db.session import SessionLocal
from sqlalchemy import text

def add_zalo_app_id_column():
    """Add zalo_app_id column to tbl_hotel_brands table"""
    db = SessionLocal()
    try:
        # Check if column already exists
        check_query = """
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'tbl_hotel_brands' 
        AND COLUMN_NAME = 'zalo_app_id'
        """
        result = db.execute(text(check_query)).fetchone()
        
        if result.count == 0:
            # Add the column
            alter_query = """
            ALTER TABLE tbl_hotel_brands 
            ADD COLUMN zalo_app_id VARCHAR(50) NULL 
            AFTER zalo_oa_id
            """
            db.execute(text(alter_query))
            db.commit()
            print("✅ Successfully added zalo_app_id column to tbl_hotel_brands table")
        else:
            print("ℹ️ Column zalo_app_id already exists in tbl_hotel_brands table")
            
    except Exception as e:
        db.rollback()
        print(f"❌ Error adding column: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Running migration to add zalo_app_id column...")
    add_zalo_app_id_column()
    print("✅ Migration completed!")
