"""
Script to create sample admin users and tenants for development using SQLite
Usage: python scripts/create_sample_data_sqlite.py
"""
import sys
import os
import sqlite3
import hashlib
from datetime import datetime, timezone

# Add app directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def hash_password(password: str) -> str:
    """Simple password hashing for testing"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_sample_data_sqlite():
    """Create sample data using SQLite for quick testing"""
    
    # Create SQLite database
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "test_local.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Create tables if they don't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tbl_tenants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                domain TEXT UNIQUE NOT NULL,
                status TEXT DEFAULT 'active',
                created_at TEXT,
                updated_at TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tbl_admin_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                full_name TEXT,
                role TEXT NOT NULL,
                status TEXT DEFAULT 'active',
                tenant_id INTEGER,
                created_at TEXT,
                updated_at TEXT,
                FOREIGN KEY (tenant_id) REFERENCES tbl_tenants (id)
            )
        """)
        
        # Create sample tenant
        cursor.execute("SELECT id FROM tbl_tenants WHERE domain = ?", ("demo.hotel.com",))
        existing_tenant = cursor.fetchone()
        
        if not existing_tenant:
            cursor.execute("""
                INSERT INTO tbl_tenants (name, domain, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
            """, ("Demo Hotel", "demo.hotel.com", "active", 
                  datetime.now(timezone.utc).isoformat(), 
                  datetime.now(timezone.utc).isoformat()))
            tenant_id = cursor.lastrowid
            print(f"✅ Created tenant: Demo Hotel (ID: {tenant_id})")
        else:
            tenant_id = existing_tenant[0]
            print(f"✅ Tenant already exists: Demo Hotel (ID: {tenant_id})")
        
        # Create super admin
        cursor.execute("SELECT id FROM tbl_admin_users WHERE username = ?", ("superadmin",))
        existing_super_admin = cursor.fetchone()
        
        if not existing_super_admin:
            hashed_password = hash_password("admin123")
            cursor.execute("""
                INSERT INTO tbl_admin_users (username, email, hashed_password, full_name, role, status, tenant_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, ("superadmin", "superadmin@hotel.com", hashed_password, "Super Administrator", 
                  "super_admin", "active", None,
                  datetime.now(timezone.utc).isoformat(),
                  datetime.now(timezone.utc).isoformat()))
            print(f"✅ Created super admin: superadmin")
        else:
            print(f"✅ Super admin already exists: superadmin")
        
        # Create hotel admin for demo tenant
        cursor.execute("SELECT id FROM tbl_admin_users WHERE username = ?", ("hoteladmin",))
        existing_hotel_admin = cursor.fetchone()
        
        if not existing_hotel_admin:
            hashed_password = hash_password("admin123")
            cursor.execute("""
                INSERT INTO tbl_admin_users (username, email, hashed_password, full_name, role, status, tenant_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, ("hoteladmin", "hoteladmin@demo.hotel.com", hashed_password, "Hotel Administrator",
                  "hotel_admin", "active", tenant_id,
                  datetime.now(timezone.utc).isoformat(),
                  datetime.now(timezone.utc).isoformat()))
            print(f"✅ Created hotel admin: hoteladmin for tenant Demo Hotel")
        else:
            print(f"✅ Hotel admin already exists: hoteladmin")
        
        # Create rooms table and sample data
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tbl_rooms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tenant_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                room_type TEXT NOT NULL,
                price_per_night REAL NOT NULL,
                capacity INTEGER NOT NULL,
                description TEXT,
                amenities TEXT,
                status TEXT DEFAULT 'available',
                created_at TEXT,
                updated_at TEXT,
                FOREIGN KEY (tenant_id) REFERENCES tbl_tenants (id)
            )
        """)
        
        # Add sample rooms
        sample_rooms = [
            ("Standard Room", "standard", 100.0, 2, "Comfortable standard room with basic amenities", "WiFi,AC,TV", "available"),
            ("Deluxe Room", "deluxe", 150.0, 2, "Spacious deluxe room with city view", "WiFi,AC,TV,Minibar", "available"),
            ("Suite", "suite", 300.0, 4, "Luxury suite with separate living area", "WiFi,AC,TV,Minibar,Jacuzzi", "available"),
        ]
        
        for room_data in sample_rooms:
            cursor.execute("SELECT id FROM tbl_rooms WHERE name = ? AND tenant_id = ?", (room_data[0], tenant_id))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO tbl_rooms (tenant_id, name, room_type, price_per_night, capacity, description, amenities, status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (tenant_id,) + room_data + (
                    datetime.now(timezone.utc).isoformat(),
                    datetime.now(timezone.utc).isoformat()
                ))
                print(f"✅ Created room: {room_data[0]}")
        
        # Create promotions table and sample data
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tbl_promotions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tenant_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                discount_percentage REAL,
                discount_amount REAL,
                min_nights INTEGER,
                start_date TEXT,
                end_date TEXT,
                promo_code TEXT,
                status TEXT DEFAULT 'active',
                created_at TEXT,
                updated_at TEXT,
                FOREIGN KEY (tenant_id) REFERENCES tbl_tenants (id)
            )
        """)
        
        # Add sample promotions
        sample_promotions = [
            ("Early Bird Special", "Book 30 days in advance and save 20%", 20.0, None, 2, "2024-01-01", "2024-12-31", "EARLY20", "active"),
            ("Weekend Getaway", "Special weekend package", None, 50.0, 2, "2024-01-01", "2024-12-31", "WEEKEND50", "active"),
        ]
        
        for promo_data in sample_promotions:
            cursor.execute("SELECT id FROM tbl_promotions WHERE title = ? AND tenant_id = ?", (promo_data[0], tenant_id))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO tbl_promotions (tenant_id, title, description, discount_percentage, discount_amount, min_nights, start_date, end_date, promo_code, status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (tenant_id,) + promo_data + (
                    datetime.now(timezone.utc).isoformat(),
                    datetime.now(timezone.utc).isoformat()
                ))
                print(f"✅ Created promotion: {promo_data[0]}")
        
        conn.commit()
        
        print("\n🎉 Sample data created successfully!")
        print(f"\n📄 Database file: {db_path}")
        print("\n🔑 Login credentials:")
        print("Super Admin: username=superadmin, password=admin123")
        print("Hotel Admin: username=hoteladmin, password=admin123")
        
        # Display data summary
        cursor.execute("SELECT COUNT(*) FROM tbl_tenants")
        tenant_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM tbl_admin_users")
        user_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM tbl_rooms")
        room_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM tbl_promotions")
        promo_count = cursor.fetchone()[0]
        
        print(f"\n📊 Data Summary:")
        print(f"Tenants: {tenant_count}")
        print(f"Users: {user_count}")
        print(f"Rooms: {room_count}")
        print(f"Promotions: {promo_count}")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    create_sample_data_sqlite()
