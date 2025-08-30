"""
Script to create comprehensive sample data for all modules
Usage: python scripts/create_all_sample_data.py
"""
import sys
import os
from datetime import datetime, timezone, timedelta
import random

# Add app directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session_local import SessionLocal
from app.models.models import (
    TblTenants, TblAdminUsers, TblHotelBrands, TblCustomers, 
    TblRooms, TblBookingRequests
)
from sqlalchemy.orm import Session

def create_all_sample_data():
    """Create comprehensive sample data for all modules"""
    db: Session = SessionLocal()
    
    try:
        # Get first tenant
        tenant = db.query(TblTenants).filter(TblTenants.deleted == 0).first()
        if not tenant:
            print("❌ No tenant found. Please create tenant first.")
            return
        
        print(f"🏢 Using tenant: {tenant.name} (ID: {tenant.id})")
        
        # Create rooms directly
        rooms_data = [
            {
                "room_name": "Standard Room 101",
                "room_type": "Standard",
                "description": "Phòng tiêu chuẩn với đầy đủ tiện nghi cơ bản",
                "price": 1200000,
                "capacity_adults": 2,
                "capacity_children": 1,
                "size_m2": 25,
                "view_type": "City View"
            },
            {
                "room_name": "Standard Room 102", 
                "room_type": "Standard",
                "description": "Phòng tiêu chuẩn với đầy đủ tiện nghi cơ bản",
                "price": 1200000,
                "capacity_adults": 2,
                "capacity_children": 1,
                "size_m2": 25,
                "view_type": "Garden View"
            },
            {
                "room_name": "Deluxe Room 201",
                "room_type": "Deluxe",
                "description": "Phòng cao cấp với view đẹp và không gian rộng rãi",
                "price": 1800000,
                "capacity_adults": 2,
                "capacity_children": 2,
                "size_m2": 35,
                "view_type": "Sea View"
            },
            {
                "room_name": "Deluxe Room 202",
                "room_type": "Deluxe", 
                "description": "Phòng cao cấp với view đẹp và không gian rộng rãi",
                "price": 1800000,
                "capacity_adults": 2,
                "capacity_children": 2,
                "size_m2": 35,
                "view_type": "Mountain View"
            },
            {
                "room_name": "Suite Room 301",
                "room_type": "Suite",
                "description": "Phòng suite sang trọng với phòng khách riêng biệt", 
                "price": 3500000,
                "capacity_adults": 4,
                "capacity_children": 2,
                "size_m2": 60,
                "view_type": "Ocean View",
                "has_balcony": True
            },
            {
                "room_name": "Presidential Suite 401",
                "room_type": "Presidential",
                "description": "Phòng tổng thống đẳng cấp với dịch vụ butler",
                "price": 5000000,
                "capacity_adults": 6,
                "capacity_children": 3,
                "size_m2": 100,
                "view_type": "Panoramic View",
                "has_balcony": True
            }
        ]
        
        created_rooms = []
        for room_data in rooms_data:
            existing_room = db.query(TblRooms).filter(
                TblRooms.room_name == room_data["room_name"],
                TblRooms.tenant_id == tenant.id,
                TblRooms.deleted == 0
            ).first()
            
            if not existing_room:
                room = TblRooms(
                    room_name=room_data["room_name"],
                    room_type=room_data["room_type"],
                    description=room_data["description"],
                    price=room_data["price"],
                    capacity_adults=room_data["capacity_adults"],
                    capacity_children=room_data["capacity_children"],
                    size_m2=room_data["size_m2"],
                    view_type=room_data["view_type"],
                    has_balcony=room_data.get("has_balcony", False),
                    tenant_id=tenant.id,
                    created_at=datetime.now(timezone.utc),
                    deleted=0
                )
                db.add(room)
                db.flush()
                created_rooms.append(room)
                print(f"✅ Created room: {room_data['room_name']}")
            else:
                created_rooms.append(existing_room)
                print(f"ℹ️ Room already exists: {room_data['room_name']}")
        
        # Create customers
        customers_data = [
            {
                "name": "Nguyễn Văn An",
                "email": "nguyenvanan@gmail.com",
                "phone": "+84 901 234 567",
                "zalo_user_id": "nguyenvanan_zalo"
            },
            {
                "name": "Trần Thị Bình",
                "email": "tranthibinh@gmail.com", 
                "phone": "+84 902 345 678",
                "zalo_user_id": "tranthibinh_zalo"
            },
            {
                "name": "Lê Minh Cường",
                "email": "leminhcuong@gmail.com",
                "phone": "+84 903 456 789", 
                "zalo_user_id": "leminhcuong_zalo"
            },
            {
                "name": "Phạm Thị Dung",
                "email": "phamthidung@gmail.com",
                "phone": "+84 904 567 890",
                "zalo_user_id": "phamthidung_zalo"
            },
            {
                "name": "Hoàng Văn Em",
                "email": "hoangvanem@gmail.com",
                "phone": "+84 905 678 901",
                "zalo_user_id": "hoangvanem_zalo"
            }
        ]
        
        created_customers = []
        for cust_data in customers_data:
            existing_customer = db.query(TblCustomers).filter(
                TblCustomers.email == cust_data["email"],
                TblCustomers.tenant_id == tenant.id,
                TblCustomers.deleted == 0
            ).first()
            
            if not existing_customer:
                customer = TblCustomers(
                    name=cust_data["name"],
                    email=cust_data["email"],
                    phone=cust_data["phone"],
                    zalo_user_id=cust_data["zalo_user_id"],
                    tenant_id=tenant.id,
                    created_at=datetime.now(timezone.utc),
                    deleted=0
                )
                db.add(customer)
                db.flush()
                created_customers.append(customer)
                print(f"✅ Created customer: {cust_data['name']}")
            else:
                created_customers.append(existing_customer)
                print(f"ℹ️ Customer already exists: {cust_data['name']}")
        
        # Create booking requests
        booking_statuses = ["requested", "confirmed", "checked_in", "checked_out", "cancelled"]
        
        for i in range(10):  # Create 10 bookings
            customer = random.choice(created_customers)
            room = random.choice(created_rooms)
            
            # Random dates in the past 30 days and future 30 days
            base_date = datetime.now(timezone.utc)
            booking_date = base_date + timedelta(days=random.randint(-30, 0))
            check_in = base_date + timedelta(days=random.randint(-15, 30))
            check_out = check_in + timedelta(days=random.randint(1, 7))
            
            booking = TblBookingRequests(
                customer_id=customer.id,
                room_id=room.id,
                mobile_number=customer.phone,
                booking_date=booking_date,
                check_in_date=check_in,
                check_out_date=check_out,
                note=f"Yêu cầu đặt phòng số {i+1}",
                request_channel="zalo_chat",
                status=random.choice(booking_statuses),
                tenant_id=tenant.id,
                created_at=datetime.now(timezone.utc),
                deleted=0
            )
            db.add(booking)
            print(f"✅ Created booking: {customer.name} - Room {room.room_name}")
        
        db.commit()
        print(f"\n🎉 Successfully created all sample data!")
        print(f"   • Rooms: {len(created_rooms)}")
        print(f"   • Customers: {len(created_customers)}")
        print(f"   • Bookings: 10")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    create_all_sample_data()
