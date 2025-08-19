"""
Script to create real MySQL data for Hotel SaaS
Run: python create_mysql_data_python.py
"""
import pymysql
from passlib.context import CryptContext
from datetime import datetime, date

# Password context for bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MySQL connection config - UPDATED from config_mysql_local.py
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '123456',  # Using password from config_mysql_local.py
    'charset': 'utf8mb4'
}

def hash_password(password: str) -> str:
    """Hash password with bcrypt"""
    return pwd_context.hash(password)

def create_database_and_tables(cursor):
    """Create database and tables"""
    
    # Create database
    cursor.execute("CREATE DATABASE IF NOT EXISTS bookingservicesiovn_zalominidb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    cursor.execute("USE bookingservicesiovn_zalominidb")
    
    # Create tenants table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tbl_tenants (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            domain VARCHAR(100) NOT NULL UNIQUE,
            status ENUM('active', 'inactive') DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    """)
    
    # Create admin users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tbl_admin_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            hashed_password VARCHAR(255) NOT NULL,
            full_name VARCHAR(100),
            role ENUM('super_admin', 'hotel_admin') NOT NULL,
            status ENUM('active', 'inactive') DEFAULT 'active',
            tenant_id INT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (tenant_id) REFERENCES tbl_tenants(id) ON DELETE SET NULL
        )
    """)
    
    # Create rooms table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tbl_rooms (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tenant_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            room_type VARCHAR(50) NOT NULL,
            price_per_night DECIMAL(10,2) NOT NULL,
            capacity INT NOT NULL,
            description TEXT,
            amenities TEXT,
            status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (tenant_id) REFERENCES tbl_tenants(id) ON DELETE CASCADE
        )
    """)
    
    # Create promotions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tbl_promotions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tenant_id INT NOT NULL,
            title VARCHAR(100) NOT NULL,
            description TEXT,
            discount_percentage DECIMAL(5,2),
            discount_amount DECIMAL(10,2),
            min_nights INT DEFAULT 1,
            start_date DATE,
            end_date DATE,
            promo_code VARCHAR(50),
            status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (tenant_id) REFERENCES tbl_tenants(id) ON DELETE CASCADE
        )
    """)
    
    print("✅ Database and tables created successfully!")

def insert_sample_data(cursor):
    """Insert sample data"""
    
    # Insert tenants
    tenants = [
        (1, 'Grand Hotel Saigon', 'grandhotel.vn', 'active'),
        (2, 'Beach Resort Da Nang', 'beachresort.vn', 'active'),
        (3, 'Mountain Lodge Sapa', 'mountainlodge.vn', 'active')
    ]
    
    for tenant in tenants:
        cursor.execute("""
            INSERT IGNORE INTO tbl_tenants (id, name, domain, status) 
            VALUES (%s, %s, %s, %s)
        """, tenant)
    
    # Hash password for admin123
    hashed_password = hash_password("admin123")
    
    # Insert admin users (matching existing table structure)
    users = [
        ('superadmin', hashed_password, 'superadmin@hotelsaas.com', 'super_admin', 'active', None),
        ('admin_grand', hashed_password, 'admin@grandhotel.vn', 'hotel_admin', 'active', 1),
        ('admin_beach', hashed_password, 'admin@beachresort.vn', 'hotel_admin', 'active', 2),
        ('admin_mountain', hashed_password, 'admin@mountainlodge.vn', 'hotel_admin', 'active', 3)
    ]
    
    for user in users:
        cursor.execute("""
            INSERT IGNORE INTO tbl_admin_users (username, hashed_password, email, role, status, tenant_id)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, user)
    
    # Insert rooms for Grand Hotel Saigon (matching existing table structure)
    rooms_grand = [
        (1, 'deluxe', 'Deluxe City View', 'Deluxe room with stunning city skyline view', 150.00, 2, 0, 35, 'city_view', 1),
        (1, 'suite', 'Executive Suite', 'Spacious executive suite with separate living area', 300.00, 4, 0, 80, 'city_view', 1),
        (1, 'standard', 'Standard Twin', 'Comfortable standard room with twin beds', 100.00, 2, 0, 25, 'street_view', 0),
        (1, 'presidential', 'Presidential Suite', 'Luxurious presidential suite with panoramic views', 800.00, 6, 0, 150, 'panoramic', 1),
        (1, 'family', 'Family Room', 'Perfect for families with children', 200.00, 4, 2, 45, 'city_view', 0)
    ]
    
    # Insert rooms for Beach Resort Da Nang
    rooms_beach = [
        (2, 'villa', 'Ocean View Villa', 'Private villa with direct ocean access', 400.00, 6, 0, 120, 'ocean_view', 1),
        (2, 'bungalow', 'Beach Bungalow', 'Cozy bungalow steps from the beach', 180.00, 2, 0, 40, 'beach_view', 1),
        (2, 'suite', 'Sunset Suite', 'Suite with perfect sunset views', 250.00, 4, 0, 60, 'sunset_view', 1)
    ]
    
    # Insert rooms for Mountain Lodge Sapa
    rooms_mountain = [
        (3, 'cabin', 'Mountain View Cabin', 'Rustic cabin with mountain views', 120.00, 2, 0, 30, 'mountain_view', 0),
        (3, 'suite', 'Valley Suite', 'Suite overlooking the valley', 200.00, 4, 0, 50, 'valley_view', 1)
    ]
    
    all_rooms = rooms_grand + rooms_beach + rooms_mountain
    
    for room in all_rooms:
        cursor.execute("""
            INSERT IGNORE INTO tbl_rooms (tenant_id, room_type, room_name, description, price, capacity_adults, capacity_children, size_m2, view_type, has_balcony)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, room)
    
    # Insert promotions
    promotions = [
        # Grand Hotel promotions
        (1, 'Early Bird Booking', 'Book 30 days in advance and save 20%', 20.00, None, 2, '2024-01-01', '2024-12-31', 'EARLY20', 'active'),
        (1, 'Weekend Special', 'Special weekend package with breakfast', None, 50.00, 2, '2024-01-01', '2024-12-31', 'WEEKEND50', 'active'),
        (1, 'Long Stay Discount', 'Stay 7+ nights and get 25% off', 25.00, None, 7, '2024-01-01', '2024-12-31', 'LONGSTAY25', 'active'),
        
        # Beach Resort promotions
        (2, 'Summer Beach Special', 'Summer promotion with spa package', 15.00, None, 3, '2024-06-01', '2024-08-31', 'SUMMER15', 'active'),
        (2, 'Honeymoon Package', 'Romantic getaway for newlyweds', None, 100.00, 3, '2024-01-01', '2024-12-31', 'HONEYMOON', 'active'),
        
        # Mountain Lodge promotions
        (3, 'Mountain Adventure', 'Trekking package with guide included', 10.00, None, 2, '2024-01-01', '2024-12-31', 'TREK10', 'active'),
        (3, 'Winter Warmth', 'Cozy winter stay with hot meals', None, 30.00, 1, '2024-12-01', '2025-02-28', 'WINTER30', 'active')
    ]
    
    for promo in promotions:
        cursor.execute("""
            INSERT IGNORE INTO tbl_promotions (tenant_id, title, description, discount_percentage, discount_amount, min_nights, start_date, end_date, promo_code, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, promo)
    
    print("✅ Sample data inserted successfully!")

def main():
    """Main function to create database and insert data"""
    try:
        # Connect to MySQL
        connection = pymysql.connect(**MYSQL_CONFIG)
        cursor = connection.cursor()
        
        print("🔗 Connected to MySQL successfully!")
        
        # Create database and tables
        create_database_and_tables(cursor)
        
        # Insert sample data
        insert_sample_data(cursor)
        
        # Commit changes
        connection.commit()
        
        # Show summary
        cursor.execute("USE bookingservicesiovn_zalominidb")
        cursor.execute("SELECT COUNT(*) FROM tbl_tenants")
        tenant_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM tbl_admin_users")
        user_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM tbl_rooms")
        room_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM tbl_promotions")
        promo_count = cursor.fetchone()[0]
        
        print("\n🎉 Database setup completed successfully!")
        print(f"📊 Created: {tenant_count} tenants, {user_count} users, {room_count} rooms, {promo_count} promotions")
        
        print("\n🔑 Login Credentials:")
        print("Super Admin: superadmin / admin123")
        print("Hotel Admins: admin_grand, admin_beach, admin_mountain / admin123")
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n🔧 Make sure to:")
        print("1. Update MYSQL_CONFIG with your MySQL credentials")
        print("2. Install required packages: pip install pymysql passlib[bcrypt]")
        print("3. Ensure MySQL server is running")

if __name__ == "__main__":
    main()
