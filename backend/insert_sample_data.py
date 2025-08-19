"""
Simple script to insert sample data into existing MySQL tables
Run: python insert_sample_data.py
"""
import pymysql
from passlib.context import CryptContext

# Password context for bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MySQL connection config
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '123456',
    'database': 'bookingservicesiovn_zalominidb',
    'charset': 'utf8mb4'
}

def hash_password(password: str) -> str:
    """Hash password with bcrypt"""
    return pwd_context.hash(password)

def insert_sample_data():
    """Insert sample data into existing tables"""
    try:
        # Connect to MySQL
        connection = pymysql.connect(**MYSQL_CONFIG)
        cursor = connection.cursor()
        
        print("🔗 Connected to MySQL successfully!")
        
        # Hash password for admin123
        hashed_password = hash_password("admin123")
        
        # 1. Insert tenants (if not exists)
        print("📝 Inserting tenants...")
        tenants = [
            (1, 'Grand Hotel Saigon', 'grandhotel.vn'),
            (2, 'Beach Resort Da Nang', 'beachresort.vn'),
            (3, 'Mountain Lodge Sapa', 'mountainlodge.vn')
        ]
        
        for tenant in tenants:
            cursor.execute("""
                INSERT IGNORE INTO tbl_tenants (id, name, domain) 
                VALUES (%s, %s, %s)
            """, tenant)
        
        # 2. Insert admin users
        print("👤 Inserting admin users...")
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
        
        # 3. Insert rooms
        print("🏠 Inserting rooms...")
        rooms = [
            # Grand Hotel rooms
            (1, 'deluxe', 'Deluxe City View', 'Deluxe room with stunning city skyline view', 150.00, 2, 0, 35, 'city_view', 1),
            (1, 'suite', 'Executive Suite', 'Spacious executive suite with separate living area', 300.00, 4, 0, 80, 'city_view', 1),
            (1, 'standard', 'Standard Twin', 'Comfortable standard room with twin beds', 100.00, 2, 0, 25, 'street_view', 0),
            (1, 'presidential', 'Presidential Suite', 'Luxurious presidential suite with panoramic views', 800.00, 6, 0, 150, 'panoramic', 1),
            
            # Beach Resort rooms
            (2, 'villa', 'Ocean View Villa', 'Private villa with direct ocean access', 400.00, 6, 0, 120, 'ocean_view', 1),
            (2, 'bungalow', 'Beach Bungalow', 'Cozy bungalow steps from the beach', 180.00, 2, 0, 40, 'beach_view', 1),
            
            # Mountain Lodge rooms
            (3, 'cabin', 'Mountain View Cabin', 'Rustic cabin with mountain views', 120.00, 2, 0, 30, 'mountain_view', 0),
            (3, 'suite', 'Valley Suite', 'Suite overlooking the valley', 200.00, 4, 0, 50, 'valley_view', 1)
        ]
        
        for room in rooms:
            cursor.execute("""
                INSERT IGNORE INTO tbl_rooms (tenant_id, room_type, room_name, description, price, capacity_adults, capacity_children, size_m2, view_type, has_balcony)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, room)
        
        # 4. Insert promotions
        print("🎯 Inserting promotions...")
        promotions = [
            # Grand Hotel promotions
            (1, 'Early Bird Booking', 'Book 30 days in advance and save 20%', 20.00, None, 2, '2024-01-01', '2024-12-31', 'EARLY20'),
            (1, 'Weekend Special', 'Special weekend package with breakfast', None, 50.00, 2, '2024-01-01', '2024-12-31', 'WEEKEND50'),
            
            # Beach Resort promotions
            (2, 'Summer Beach Special', 'Summer promotion with spa package', 15.00, None, 3, '2024-06-01', '2024-08-31', 'SUMMER15'),
            (2, 'Honeymoon Package', 'Romantic getaway for newlyweds', None, 100.00, 3, '2024-01-01', '2024-12-31', 'HONEYMOON'),
            
            # Mountain Lodge promotions
            (3, 'Mountain Adventure', 'Trekking package with guide included', 10.00, None, 2, '2024-01-01', '2024-12-31', 'TREK10')
        ]
        
        for promo in promotions:
            cursor.execute("""
                INSERT IGNORE INTO tbl_promotions (tenant_id, title, description, discount_percentage, discount_amount, min_nights, start_date, end_date, promo_code)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, promo)
        
        # Commit changes
        connection.commit()
        
        # Show summary
        cursor.execute("SELECT COUNT(*) FROM tbl_tenants")
        tenant_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM tbl_admin_users")
        user_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM tbl_rooms")
        room_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM tbl_promotions")
        promo_count = cursor.fetchone()[0]
        
        print("\n🎉 Sample data inserted successfully!")
        print(f"📊 Total: {tenant_count} tenants, {user_count} users, {room_count} rooms, {promo_count} promotions")
        
        print("\n🔑 Login Credentials:")
        print("Super Admin: superadmin / admin123")
        print("Hotel Admins: admin_grand, admin_beach, admin_mountain / admin123")
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    insert_sample_data()
