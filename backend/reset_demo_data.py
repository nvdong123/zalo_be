#!/usr/bin/env python3
"""
Script làm sạch và tạo lại dữ liệu demo hoàn toàn mới
"""

import pymysql
from datetime import datetime, date, timedelta
import json

# Database config cho VPS - sử dụng cùng user với API
DB_CONFIG = {
    'host': 'localhost',
    'user': 'hotel_app_user',
    'password': 'HotelApp2025!@#Secure',
    'database': 'bookingservicesiovn_zalominidb',
    'charset': 'utf8mb4'
}

def clean_demo_data():
    """Xóa tất cả dữ liệu demo cũ"""
    try:
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("🧹 XÓA DỮ LIỆU DEMO CŨ...")
        print("=" * 50)
        
        # Xóa theo thứ tự để tránh foreign key constraint
        tables_to_clean = [
            'tbl_customer_vouchers',
            'tbl_service_bookings', 
            'tbl_room_stays',
            'tbl_booking_requests',
            'tbl_vouchers',
            'tbl_promotions',
            'tbl_customers',
            'tbl_facility_features',
            'tbl_facilities',
            'tbl_room_features',
            'tbl_room_amenities',
            'tbl_rooms',
            'tbl_services',
            'tbl_hotel_brands',
            'tbl_admin_users',
            'tbl_tenants'
        ]
        
        for table in tables_to_clean:
            try:
                cursor.execute(f"DELETE FROM {table} WHERE created_by = 'demo_script' OR created_by = 'system'")
                deleted = cursor.rowcount
                if deleted > 0:
                    print(f"   🗑️  {table}: {deleted} records deleted")
            except Exception as e:
                print(f"   ⚠️  {table}: {e}")
        
        connection.commit()
        print("✅ Dữ liệu cũ đã được xóa!")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi khi xóa dữ liệu: {e}")
        return False
    finally:
        if 'connection' in locals():
            connection.close()

def create_fresh_demo_data():
    """Tạo dữ liệu demo hoàn toàn mới"""
    
    try:
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("\n🏨 TẠO DỮ LIỆU DEMO MỚI")
        print("=" * 50)
        
        current_time = datetime.now()
        
        # 1. Tạo Admin Users sau (sẽ update tenant_id sau khi tạo tenants)
        print("👤 Tạo Admin Users...")
        admin_users = [
            {
                'tenant_id': None, 'username': 'superadmin', 'email': 'admin@hotel-saas.com',
                'password': 'admin123', 'role': 'super_admin'
            }
        ]
        
        import hashlib
        for admin in admin_users:
            hashed_password = hashlib.sha256(admin['password'].encode()).hexdigest()
            cursor.execute("""
                INSERT INTO tbl_admin_users (
                    tenant_id, username, hashed_password, email, role, status,
                    created_at, updated_at, created_by
                ) VALUES (%s, %s, %s, %s, %s, 'active', %s, %s, 'demo_script')
            """, (
                admin['tenant_id'], admin['username'], hashed_password,
                admin['email'], admin['role'], current_time, current_time
            ))
            print(f"   ✅ {admin['username']} ({admin['role']})")
        
        # 2. Tạo Tenants
        print("🏢 Tạo Tenants...")
        tenants_data = [
            {'name': 'Grand Hotel Chain', 'domain': 'grandhotel.vn'},
            {'name': 'Beach Resort Group', 'domain': 'beachresort.vn'}
        ]
        
        tenant_ids = {}
        for tenant in tenants_data:
            cursor.execute("""
                INSERT INTO tbl_tenants (name, domain, status, created_at, updated_at, created_by)
                VALUES (%s, %s, 'active', %s, %s, 'demo_script')
            """, (tenant['name'], tenant['domain'], current_time, current_time))
            tenant_id = cursor.lastrowid
            tenant_ids[tenant['name']] = tenant_id
            print(f"   ✅ {tenant['name']} (ID: {tenant_id})")
        
        grand_hotel_tenant_id = tenant_ids['Grand Hotel Chain']
        beach_resort_tenant_id = tenant_ids['Beach Resort Group']
        
        # Tạo hotel admin users với tenant_id đúng
        print("👤 Tạo Hotel Admin Users...")
        hotel_admins = [
            {
                'tenant_id': grand_hotel_tenant_id, 'username': 'admin_grand', 
                'email': 'admin@grandhotel.com', 'password': 'admin123', 'role': 'hotel_admin'
            },
            {
                'tenant_id': beach_resort_tenant_id, 'username': 'admin_beach',
                'email': 'admin@beachresort.com', 'password': 'admin123', 'role': 'hotel_admin'
            }
        ]
        
        for admin in hotel_admins:
            hashed_password = hashlib.sha256(admin['password'].encode()).hexdigest()
            cursor.execute("""
                INSERT INTO tbl_admin_users (
                    tenant_id, username, hashed_password, email, role, status,
                    created_at, updated_at, created_by
                ) VALUES (%s, %s, %s, %s, %s, 'active', %s, %s, 'demo_script')
            """, (
                admin['tenant_id'], admin['username'], hashed_password,
                admin['email'], admin['role'], current_time, current_time
            ))
            print(f"   ✅ {admin['username']} (Tenant {admin['tenant_id']})")
        
        # 3. Tạo Hotel Brands
        print("🏨 Tạo Hotel Brands...")
        hotel_brands = [
            {
                'tenant_id': grand_hotel_tenant_id, 'hotel_name': 'Grand Palace Hotel',
                'slogan': 'Luxury Beyond Expectation',
                'description': 'Khách sạn 5 sao hàng đầu với dịch vụ đẳng cấp quốc tế',
                'address': '123 Trần Hưng Đạo, Quận 1, TP.HCM',
                'city': 'Hồ Chí Minh', 'phone_number': '+84 28 3822 1234',
                'email': 'info@grandpalace.vn'
            },
            {
                'tenant_id': beach_resort_tenant_id, 'hotel_name': 'Sunset Beach Resort',
                'slogan': 'Where Ocean Meets Paradise', 
                'description': 'Resort biển tuyệt đẹp với view hoàng hôn lãng mạn',
                'address': '789 Nguyễn Đình Chiểu, Hàm Tiến, Phan Thiết',
                'city': 'Bình Thuận', 'phone_number': '+84 252 3847 999',
                'email': 'booking@sunsetbeach.vn'
            }
        ]
        
        for brand in hotel_brands:
            cursor.execute("""
                INSERT INTO tbl_hotel_brands (
                    tenant_id, hotel_name, slogan, description, address, city,
                    phone_number, email, created_at, updated_at, created_by
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'demo_script')
            """, (
                brand['tenant_id'], brand['hotel_name'], brand['slogan'],
                brand['description'], brand['address'], brand['city'],
                brand['phone_number'], brand['email'], current_time, current_time
            ))
            print(f"   ✅ {brand['hotel_name']}")
        
        # 4. Tạo Rooms
        print("🛏️  Tạo Rooms...")
        rooms_data = [
            # Grand Palace Hotel
            {'tenant_id': grand_hotel_tenant_id, 'room_type': 'Deluxe', 'room_name': 'Deluxe City View', 'price': 2500000, 'capacity_adults': 2, 'size_m2': 45},
            {'tenant_id': grand_hotel_tenant_id, 'room_type': 'Suite', 'room_name': 'Executive Suite', 'price': 4500000, 'capacity_adults': 2, 'size_m2': 80},
            {'tenant_id': grand_hotel_tenant_id, 'room_type': 'Presidential', 'room_name': 'Presidential Suite', 'price': 8500000, 'capacity_adults': 4, 'size_m2': 150},
            # Sunset Beach Resort
            {'tenant_id': beach_resort_tenant_id, 'room_type': 'Ocean View', 'room_name': 'Ocean Breeze Room', 'price': 3200000, 'capacity_adults': 2, 'size_m2': 50},
            {'tenant_id': beach_resort_tenant_id, 'room_type': 'Beach Villa', 'room_name': 'Sunset Villa', 'price': 6500000, 'capacity_adults': 4, 'size_m2': 120},
            {'tenant_id': beach_resort_tenant_id, 'room_type': 'Pool Villa', 'room_name': 'Private Pool Villa', 'price': 9500000, 'capacity_adults': 6, 'size_m2': 200}
        ]
        
        for room in rooms_data:
            cursor.execute("""
                INSERT INTO tbl_rooms (
                    tenant_id, room_type, room_name, price, capacity_adults, size_m2,
                    created_at, updated_at, created_by
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'demo_script')
            """, (
                room['tenant_id'], room['room_type'], room['room_name'],
                room['price'], room['capacity_adults'], room['size_m2'],
                current_time, current_time
            ))
            print(f"   ✅ {room['room_name']} - {room['price']:,} VND")
        
        # 5. Tạo Facilities
        print("🏊 Tạo Facilities...")
        facilities_data = [
            # Grand Palace Hotel
            {'tenant_id': grand_hotel_tenant_id, 'facility_name': 'Royal Spa & Wellness', 'type': 'spa'},
            {'tenant_id': grand_hotel_tenant_id, 'facility_name': 'Le Grand Restaurant', 'type': 'restaurant'},
            {'tenant_id': grand_hotel_tenant_id, 'facility_name': 'Sky Fitness Center', 'type': 'gym'},
            {'tenant_id': grand_hotel_tenant_id, 'facility_name': 'Rooftop Pool', 'type': 'pool'},
            # Sunset Beach Resort
            {'tenant_id': beach_resort_tenant_id, 'facility_name': 'Ocean Spa', 'type': 'spa'},
            {'tenant_id': beach_resort_tenant_id, 'facility_name': 'Beachside Grill', 'type': 'restaurant'},
            {'tenant_id': beach_resort_tenant_id, 'facility_name': 'Water Sports Center', 'type': 'activity'},
            {'tenant_id': beach_resort_tenant_id, 'facility_name': 'Infinity Pool', 'type': 'pool'}
        ]
        
        for facility in facilities_data:
            cursor.execute("""
                INSERT INTO tbl_facilities (tenant_id, facility_name, type, created_at, updated_at, created_by)
                VALUES (%s, %s, %s, %s, %s, 'demo_script')
            """, (facility['tenant_id'], facility['facility_name'], facility['type'], current_time, current_time))
            print(f"   ✅ {facility['facility_name']}")
        
        # 6. Tạo Services
        print("🔧 Tạo Services...")
        services_data = [
            # Grand Palace Hotel
            {'tenant_id': grand_hotel_tenant_id, 'service_name': 'Airport Transfer', 'category': 'transport', 'price': 500000},
            {'tenant_id': grand_hotel_tenant_id, 'service_name': 'Spa Treatment', 'category': 'spa', 'price': 1200000},
            {'tenant_id': grand_hotel_tenant_id, 'service_name': 'Fine Dining', 'category': 'restaurant', 'price': 800000},
            # Sunset Beach Resort  
            {'tenant_id': beach_resort_tenant_id, 'service_name': 'Sunset Cruise', 'category': 'tour', 'price': 1500000},
            {'tenant_id': beach_resort_tenant_id, 'service_name': 'Massage Therapy', 'category': 'spa', 'price': 900000},
            {'tenant_id': beach_resort_tenant_id, 'service_name': 'Beach BBQ', 'category': 'restaurant', 'price': 650000}
        ]
        
        for service in services_data:
            cursor.execute("""
                INSERT INTO tbl_services (tenant_id, service_name, category, price, created_at, updated_at, created_by)
                VALUES (%s, %s, %s, %s, %s, %s, 'demo_script')
            """, (service['tenant_id'], service['service_name'], service['category'], service['price'], current_time, current_time))
            print(f"   ✅ {service['service_name']} - {service['price']:,} VND")
        
        # 7. Tạo Demo Customers
        print("👥 Tạo Demo Customers...")
        customers_data = [
            {'tenant_id': grand_hotel_tenant_id, 'name': 'Nguyễn Văn A', 'phone': '0901234567', 'email': 'nguyenvana@gmail.com'},
            {'tenant_id': grand_hotel_tenant_id, 'name': 'Trần Thị B', 'phone': '0912345678', 'email': 'tranthib@gmail.com'},
            {'tenant_id': grand_hotel_tenant_id, 'name': 'Lê Hoàng C', 'phone': '0923456789', 'email': 'lehoangc@gmail.com'},
            {'tenant_id': beach_resort_tenant_id, 'name': 'Phạm Minh D', 'phone': '0934567890', 'email': 'phamminhd@gmail.com'},
            {'tenant_id': beach_resort_tenant_id, 'name': 'Hoàng Thị E', 'phone': '0945678901', 'email': 'hoangthie@gmail.com'},
            {'tenant_id': beach_resort_tenant_id, 'name': 'Vũ Quang F', 'phone': '0956789012', 'email': 'vuquangf@gmail.com'}
        ]
        
        for customer in customers_data:
            cursor.execute("""
                INSERT INTO tbl_customers (tenant_id, name, phone, email, created_at, updated_at, created_by)
                VALUES (%s, %s, %s, %s, %s, %s, 'demo_script')
            """, (customer['tenant_id'], customer['name'], customer['phone'], customer['email'], current_time, current_time))
            print(f"   ✅ {customer['name']}")
        
        connection.commit()
        
        print("\n🎯 TẠO DỮ LIỆU DEMO HOÀN TẤT!")
        print("=" * 60)
        print("✅ Admin Users: 3")
        print("✅ Tenants: 2")
        print("✅ Hotel Brands: 2")
        print("✅ Rooms: 6")
        print("✅ Facilities: 8") 
        print("✅ Services: 6")
        print("✅ Customers: 6")
        
        print(f"\n🌐 URL: http://157.10.199.22/")
        print("🔑 Tài khoản đăng nhập:")
        print("   • superadmin / admin123 (Super Admin)")
        print("   • admin_grand / admin123 (Grand Palace Hotel)")
        print("   • admin_beach / admin123 (Sunset Beach Resort)")
        print("\n🎪 Sẵn sàng cho PRESENTATION! 🚀")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False
    finally:
        if 'connection' in locals():
            connection.close()

def main():
    print("🔄 RESET VÀ TẠO LẠI DỮ LIỆU DEMO")
    print("=" * 60)
    
    # Bước 1: Xóa dữ liệu cũ
    if clean_demo_data():
        # Bước 2: Tạo dữ liệu mới
        create_fresh_demo_data()
    else:
        print("❌ Không thể xóa dữ liệu cũ!")

if __name__ == "__main__":
    main()
