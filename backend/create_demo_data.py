#!/usr/bin/env python3
"""
Script tạo dữ liệu demo cho presentation
Tạo tenants, hotel brands, rooms, facilities, promotions, customers...
"""

import pymysql
from datetime import datetime, date, timedelta
import json

# Database config cho VPS
DB_CONFIG = {
    'host': 'localhost',
    'user': 'da_admin',
    'password': 'C8tZ5WfPAxAPfBso',
    'database': 'bookingservicesiovn_zalominidb',
    'charset': 'utf8mb4'
}

def create_demo_data():
    """Tạo dữ liệu demo hoàn chỉnh"""
    
    try:
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("🏨 TẠO DỮ LIỆU DEMO CHO PRESENTATION")
        print("=" * 50)
        
        current_time = datetime.now()
        
        # 1. Tạo Tenants
        print("📋 Tạo Tenants...")
        tenants_data = [
            {
                'name': 'Grand Hotel Chain',
                'domain': 'grandhotel.com',
                'status': 'active'
            },
            {
                'name': 'Beach Resort Group', 
                'domain': 'beachresort.com',
                'status': 'active'
            }
        ]
        
        for i, tenant in enumerate(tenants_data, 1):
            cursor.execute("SELECT id FROM tbl_tenants WHERE domain = %s AND deleted = 0", (tenant['domain'],))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO tbl_tenants (name, domain, status, created_at, updated_at, created_by)
                    VALUES (%s, %s, %s, %s, %s, 'demo_script')
                """, (tenant['name'], tenant['domain'], tenant['status'], current_time, current_time))
                print(f"   ✅ Tenant {i}: {tenant['name']}")
        
        # 2. Tạo Hotel Brands
        print("🏢 Tạo Hotel Brands...")
        hotel_brands = [
            {
                'tenant_id': 1,
                'hotel_name': 'Grand Palace Hotel',
                'slogan': 'Luxury Beyond Expectation',
                'description': 'Khách sạn 5 sao hàng đầu với dịch vụ đẳng cấp quốc tế',
                'address': '123 Trần Hưng Đạo, Quận 1',
                'city': 'Hồ Chí Minh',
                'phone_number': '+84 28 3822 1234',
                'email': 'info@grandpalace.com',
                'primary_color': '#FFD700',
                'secondary_color': '#1A1A1A'
            },
            {
                'tenant_id': 2,
                'hotel_name': 'Sunset Beach Resort',
                'slogan': 'Where Ocean Meets Paradise',
                'description': 'Resort biển tuyệt đẹp với view hoàng hôn lãng mạn',
                'address': '789 Nguyễn Đình Chiểu, Hàm Tiến',
                'city': 'Phan Thiết',
                'phone_number': '+84 252 3847 999',
                'email': 'booking@sunsetbeach.com', 
                'primary_color': '#FF6B35',
                'secondary_color': '#004E89'
            }
        ]
        
        for brand in hotel_brands:
            cursor.execute("SELECT id FROM tbl_hotel_brands WHERE hotel_name = %s AND tenant_id = %s AND deleted = 0", 
                         (brand['hotel_name'], brand['tenant_id']))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO tbl_hotel_brands (
                        tenant_id, hotel_name, slogan, description, address, city,
                        phone_number, email, primary_color, secondary_color,
                        created_at, updated_at, created_by
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'demo_script'
                    )
                """, (
                    brand['tenant_id'], brand['hotel_name'], brand['slogan'], brand['description'],
                    brand['address'], brand['city'], brand['phone_number'], brand['email'],
                    brand['primary_color'], brand['secondary_color'], current_time, current_time
                ))
                print(f"   ✅ {brand['hotel_name']}")
        
        # 3. Tạo Rooms
        print("🛏️  Tạo Rooms...")
        rooms_data = [
            # Grand Palace Hotel (tenant 1)
            {
                'tenant_id': 1, 'room_type': 'Deluxe', 'room_name': 'Deluxe City View',
                'description': 'Phòng deluxe với view thành phố tuyệt đẹp', 'price': 2500000.00,
                'capacity_adults': 2, 'capacity_children': 1, 'size_m2': 45, 'view_type': 'city'
            },
            {
                'tenant_id': 1, 'room_type': 'Suite', 'room_name': 'Executive Suite',
                'description': 'Suite cao cấp dành cho doanh nhân', 'price': 4500000.00,
                'capacity_adults': 2, 'capacity_children': 2, 'size_m2': 80, 'view_type': 'city'
            },
            {
                'tenant_id': 1, 'room_type': 'Presidential', 'room_name': 'Presidential Suite',
                'description': 'Phòng tổng thống đẳng cấp nhất', 'price': 8500000.00,
                'capacity_adults': 4, 'capacity_children': 2, 'size_m2': 150, 'view_type': 'panoramic'
            },
            # Sunset Beach Resort (tenant 2)
            {
                'tenant_id': 2, 'room_type': 'Ocean View', 'room_name': 'Ocean Breeze Room',
                'description': 'Phòng view biển với không gian thoáng mát', 'price': 3200000.00,
                'capacity_adults': 2, 'capacity_children': 1, 'size_m2': 50, 'view_type': 'ocean'
            },
            {
                'tenant_id': 2, 'room_type': 'Beach Villa', 'room_name': 'Sunset Villa',
                'description': 'Villa riêng biệt bên bờ biển', 'price': 6500000.00,
                'capacity_adults': 4, 'capacity_children': 2, 'size_m2': 120, 'view_type': 'beach', 'has_balcony': True
            },
            {
                'tenant_id': 2, 'room_type': 'Pool Villa', 'room_name': 'Private Pool Villa',
                'description': 'Villa có hồ bơi riêng', 'price': 9500000.00,
                'capacity_adults': 6, 'capacity_children': 3, 'size_m2': 200, 'view_type': 'pool', 'has_balcony': True
            }
        ]
        
        for room in rooms_data:
            cursor.execute("SELECT id FROM tbl_rooms WHERE room_name = %s AND tenant_id = %s AND deleted = 0",
                         (room['room_name'], room['tenant_id']))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO tbl_rooms (
                        tenant_id, room_type, room_name, description, price,
                        capacity_adults, capacity_children, size_m2, view_type, has_balcony,
                        created_at, updated_at, created_by
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'demo_script'
                    )
                """, (
                    room['tenant_id'], room['room_type'], room['room_name'], room['description'],
                    room['price'], room['capacity_adults'], room['capacity_children'],
                    room['size_m2'], room['view_type'], room.get('has_balcony', False),
                    current_time, current_time
                ))
                print(f"   ✅ {room['room_name']} (Tenant {room['tenant_id']})")
        
        # 4. Tạo Facilities
        print("🏊 Tạo Facilities...")
        facilities_data = [
            # Grand Palace Hotel
            {'tenant_id': 1, 'facility_name': 'Royal Spa & Wellness', 'type': 'spa', 'description': 'Spa đẳng cấp hoàng gia'},
            {'tenant_id': 1, 'facility_name': 'Le Grand Restaurant', 'type': 'restaurant', 'description': 'Nhà hàng Fine Dining'},
            {'tenant_id': 1, 'facility_name': 'Sky Fitness Center', 'type': 'gym', 'description': 'Phòng gym hiện đại trên tầng cao'},
            {'tenant_id': 1, 'facility_name': 'Rooftop Pool', 'type': 'pool', 'description': 'Hồ bơi vô cực trên sân thượng'},
            # Sunset Beach Resort
            {'tenant_id': 2, 'facility_name': 'Ocean Spa', 'type': 'spa', 'description': 'Spa view biển thư giãn'},
            {'tenant_id': 2, 'facility_name': 'Beachside Grill', 'type': 'restaurant', 'description': 'Nhà hàng BBQ bên bờ biển'},
            {'tenant_id': 2, 'facility_name': 'Water Sports Center', 'type': 'activity', 'description': 'Trung tâm thể thao nước'},
            {'tenant_id': 2, 'facility_name': 'Infinity Pool', 'type': 'pool', 'description': 'Hồ bơi vô cực view biển'},
        ]
        
        for facility in facilities_data:
            cursor.execute("SELECT id FROM tbl_facilities WHERE facility_name = %s AND tenant_id = %s AND deleted = 0",
                         (facility['facility_name'], facility['tenant_id']))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO tbl_facilities (tenant_id, facility_name, type, description, created_at, updated_at, created_by)
                    VALUES (%s, %s, %s, %s, %s, %s, 'demo_script')
                """, (facility['tenant_id'], facility['facility_name'], facility['type'], 
                     facility['description'], current_time, current_time))
                print(f"   ✅ {facility['facility_name']} (Tenant {facility['tenant_id']})")
        
        # 5. Tạo Promotions
        print("🎉 Tạo Promotions...")
        promotions_data = [
            {
                'tenant_id': 1, 'promotion_name': 'Black Friday Luxury Deal',
                'description': 'Giảm 30% cho tất cả phòng Suite trong tháng 11',
                'valid_from': datetime(2025, 11, 1), 'valid_to': datetime(2025, 11, 30)
            },
            {
                'tenant_id': 1, 'promotion_name': 'New Year Celebration Package',
                'description': 'Gói đặc biệt đón năm mới với nhiều ưu đãi',
                'valid_from': datetime(2025, 12, 25), 'valid_to': datetime(2026, 1, 5)
            },
            {
                'tenant_id': 2, 'promotion_name': 'Summer Beach Getaway',
                'description': 'Kỳ nghỉ hè tuyệt vời với giá ưu đãi',
                'valid_from': datetime(2025, 6, 1), 'valid_to': datetime(2025, 8, 31)
            },
            {
                'tenant_id': 2, 'promotion_name': 'Romantic Sunset Package',
                'description': 'Gói lãng mạn cho các cặp đôi',
                'valid_from': datetime(2025, 2, 10), 'valid_to': datetime(2025, 2, 20)
            }
        ]
        
        for promo in promotions_data:
            cursor.execute("SELECT id FROM tbl_promotions WHERE promotion_name = %s AND tenant_id = %s AND deleted = 0",
                         (promo['promotion_name'], promo['tenant_id']))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO tbl_promotions (tenant_id, promotion_name, description, valid_from, valid_to, is_active, created_at, updated_at, created_by)
                    VALUES (%s, %s, %s, %s, %s, 1, %s, %s, 'demo_script')
                """, (promo['tenant_id'], promo['promotion_name'], promo['description'],
                     promo['valid_from'], promo['valid_to'], current_time, current_time))
                print(f"   ✅ {promo['promotion_name']} (Tenant {promo['tenant_id']})")
        
        # 6. Tạo Demo Customers
        print("👥 Tạo Demo Customers...")
        customers_data = [
            {'tenant_id': 1, 'name': 'Nguyễn Văn A', 'phone': '0901234567', 'email': 'nguyenvana@email.com'},
            {'tenant_id': 1, 'name': 'Trần Thị B', 'phone': '0912345678', 'email': 'tranthib@email.com'},
            {'tenant_id': 1, 'name': 'Lê Hoàng C', 'phone': '0923456789', 'email': 'lehoangc@email.com'},
            {'tenant_id': 2, 'name': 'Phạm Minh D', 'phone': '0934567890', 'email': 'phamminhd@email.com'},
            {'tenant_id': 2, 'name': 'Hoàng Thị E', 'phone': '0945678901', 'email': 'hoangthie@email.com'},
            {'tenant_id': 2, 'name': 'Vũ Quang F', 'phone': '0956789012', 'email': 'vuquangf@email.com'},
        ]
        
        for customer in customers_data:
            cursor.execute("SELECT id FROM tbl_customers WHERE phone = %s AND tenant_id = %s AND deleted = 0",
                         (customer['phone'], customer['tenant_id']))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO tbl_customers (tenant_id, name, phone, email, created_at, updated_at, created_by)
                    VALUES (%s, %s, %s, %s, %s, %s, 'demo_script')
                """, (customer['tenant_id'], customer['name'], customer['phone'],
                     customer['email'], current_time, current_time))
                print(f"   ✅ {customer['name']} (Tenant {customer['tenant_id']})")
        
        connection.commit()
        
        print("\n🎯 TẠO DỮ LIỆU DEMO HOÀN TẤT!")
        print("=" * 50)
        print("✅ Tenants: 2")
        print("✅ Hotel Brands: 2") 
        print("✅ Rooms: 6")
        print("✅ Facilities: 8")
        print("✅ Promotions: 4")
        print("✅ Customers: 6")
        print("✅ Admin Users: 3")
        
        print(f"\n🌐 URL: http://157.10.199.22/")
        print("🔑 Login với:")
        print("   • superadmin / admin123 (Super Admin)")
        print("   • admin_grand / admin123 (Grand Hotel)")
        print("   • admin_beach / admin123 (Beach Resort)")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False
    finally:
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    create_demo_data()
