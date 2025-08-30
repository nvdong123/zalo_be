"""
Enhanced script to create comprehensive sample data for all entities
Usage: python scripts/create_comprehensive_sample_data.py
"""
import sys
import os
from datetime import datetime, timezone, timedelta
import random

# Add app directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session_local import SessionLocal
from app.models.models import (
    TblAdminUsers, TblTenants, TblHotelBrands, TblRooms, 
    TblCustomers, TblFacilities, TblBookingRequests
)
from app.crud.crud_admin_users import crud_admin_user
from sqlalchemy.orm import Session

def create_comprehensive_sample_data():
    """Create comprehensive sample data for all entities"""
    db: Session = SessionLocal()
    
    try:
        print("🚀 Creating comprehensive sample data...")
        
        # Get existing tenant
        tenant = db.query(TblTenants).filter(TblTenants.domain == "demo.hotel.com").first()
        if not tenant:
            print("❌ Please run create_sample_data.py first to create basic tenant and admin users")
            return
        
        tenant_id = tenant.id
        print(f"✅ Using tenant: {tenant.name} (ID: {tenant_id})")
        
        # Create Hotel Brands
        print("\n📊 Creating hotel brands...")
        hotel_brands_data = [
            {
                "hotel_name": "Luxury Resort Chain",
                "description": "Premium luxury resorts with world-class amenities",
                "logo_url": "https://example.com/luxury-logo.png"
            },
            {
                "hotel_name": "Business Hotels Group", 
                "description": "Professional accommodation for business travelers",
                "logo_url": "https://example.com/business-logo.png"
            },
            {
                "hotel_name": "Boutique Collection",
                "description": "Unique boutique hotels with personalized service",
                "logo_url": "https://example.com/boutique-logo.png"
            }
        ]
        
        hotel_brands = []
        for brand_data in hotel_brands_data:
            existing_brand = db.query(TblHotelBrands).filter(
                TblHotelBrands.hotel_name == brand_data["hotel_name"],
                TblHotelBrands.tenant_id == tenant_id,
                TblHotelBrands.deleted == 0
            ).first()
            
            if not existing_brand:
                brand = TblHotelBrands(
                    tenant_id=tenant_id,
                    hotel_name=brand_data["hotel_name"],
                    description=brand_data["description"],
                    logo_url=brand_data["logo_url"],
                    created_by="system",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(brand)
                db.commit()
                db.refresh(brand)
                hotel_brands.append(brand)
                print(f"   ✅ Created hotel brand: {brand.hotel_name}")
            else:
                hotel_brands.append(existing_brand)
                print(f"   ✅ Hotel brand already exists: {existing_brand.hotel_name}")
        
        # Create Rooms
        print("\n🏨 Creating rooms...")
        room_types = ["Standard", "Deluxe", "Suite", "Presidential", "Family"]
        view_types = ["City View", "Ocean View", "Garden View", "Mountain View"]
        
        rooms = []
        for i in range(1, 21):  # Create 20 rooms
            room_type = random.choice(room_types)
            view_type = random.choice(view_types)
            
            existing_room = db.query(TblRooms).filter(
                TblRooms.room_name == f"Room {i:03d}",
                TblRooms.tenant_id == tenant_id,
                TblRooms.deleted == 0
            ).first()
            
            if not existing_room:
                room = TblRooms(
                    tenant_id=tenant_id,
                    room_type=room_type,
                    room_name=f"Room {i:03d}",
                    description=f"Beautiful {room_type.lower()} room with {view_type.lower()}",
                    price=random.randint(100, 500),
                    capacity_adults=random.randint(1, 4),
                    capacity_children=random.randint(0, 2),
                    size_m2=random.randint(25, 100),
                    view_type=view_type,
                    has_balcony=random.choice([True, False]),
                    image_url=f"https://example.com/room-{i:03d}.jpg",
                    created_by="system",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(room)
                db.commit()
                db.refresh(room)
                rooms.append(room)
                print(f"   ✅ Created room: {room.room_name} ({room.room_type})")
            else:
                rooms.append(existing_room)
                print(f"   ✅ Room already exists: {existing_room.room_name}")
        
        # Create Customers
        print("\n👥 Creating customers...")
        customers_data = [
            {"zalo_user_id": "zalo_001", "name": "Nguyễn Văn An", "phone": "0901234567", "email": "an.nguyen@email.com"},
            {"zalo_user_id": "zalo_002", "name": "Trần Thị Bình", "phone": "0901234568", "email": "binh.tran@email.com"},
            {"zalo_user_id": "zalo_003", "name": "Lê Văn Cường", "phone": "0901234569", "email": "cuong.le@email.com"},
            {"zalo_user_id": "zalo_004", "name": "Phạm Thị Dung", "phone": "0901234570", "email": "dung.pham@email.com"},
            {"zalo_user_id": "zalo_005", "name": "Hoàng Văn Em", "phone": "0901234571", "email": "em.hoang@email.com"},
            {"zalo_user_id": "zalo_006", "name": "Võ Thị Phượng", "phone": "0901234572", "email": "phuong.vo@email.com"},
            {"zalo_user_id": "zalo_007", "name": "Đặng Văn Giang", "phone": "0901234573", "email": "giang.dang@email.com"},
            {"zalo_user_id": "zalo_008", "name": "Bùi Thị Hoa", "phone": "0901234574", "email": "hoa.bui@email.com"},
            {"zalo_user_id": "zalo_009", "name": "Lý Văn Ích", "phone": "0901234575", "email": "ich.ly@email.com"},
            {"zalo_user_id": "zalo_010", "name": "Huỳnh Thị Kim", "phone": "0901234576", "email": "kim.huynh@email.com"}
        ]
        
        customers = []
        for customer_data in customers_data:
            existing_customer = db.query(TblCustomers).filter(
                TblCustomers.zalo_user_id == customer_data["zalo_user_id"],
                TblCustomers.tenant_id == tenant_id,
                TblCustomers.deleted == 0
            ).first()
            
            if not existing_customer:
                customer = TblCustomers(
                    tenant_id=tenant_id,
                    zalo_user_id=customer_data["zalo_user_id"],
                    name=customer_data["name"],
                    phone=customer_data["phone"],
                    email=customer_data["email"],
                    created_by="system",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(customer)
                db.commit()
                db.refresh(customer)
                customers.append(customer)
                print(f"   ✅ Created customer: {customer.name}")
            else:
                customers.append(existing_customer)
                print(f"   ✅ Customer already exists: {existing_customer.name}")
        
        # Create Facilities
        print("\n🏊 Creating facilities...")
        facilities_data = [
            {"facility_name": "Swimming Pool", "type": "Recreation", "image_url": "https://example.com/pool.jpg"},
            {"facility_name": "Fitness Center", "type": "Health", "image_url": "https://example.com/gym.jpg"},
            {"facility_name": "Spa & Wellness", "type": "Wellness", "image_url": "https://example.com/spa.jpg"},
            {"facility_name": "Business Center", "type": "Business", "image_url": "https://example.com/business.jpg"},
            {"facility_name": "Restaurant", "type": "Dining", "image_url": "https://example.com/restaurant.jpg"},
            {"facility_name": "Conference Room A", "type": "Meeting", "image_url": "https://example.com/conference-a.jpg"},
            {"facility_name": "Conference Room B", "type": "Meeting", "image_url": "https://example.com/conference-b.jpg"},
            {"facility_name": "Kids Play Area", "type": "Recreation", "image_url": "https://example.com/kids.jpg"},
            {"facility_name": "Rooftop Bar", "type": "Entertainment", "image_url": "https://example.com/rooftop.jpg"},
            {"facility_name": "Tennis Court", "type": "Sports", "image_url": "https://example.com/tennis.jpg"}
        ]
        
        facilities = []
        for facility_data in facilities_data:
            existing_facility = db.query(TblFacilities).filter(
                TblFacilities.facility_name == facility_data["facility_name"],
                TblFacilities.tenant_id == tenant_id,
                TblFacilities.deleted == 0
            ).first()
            
            if not existing_facility:
                facility = TblFacilities(
                    tenant_id=tenant_id,
                    facility_name=facility_data["facility_name"],
                    type=facility_data["type"],
                    image_url=facility_data["image_url"],
                    created_by="system",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(facility)
                db.commit()
                db.refresh(facility)
                facilities.append(facility)
                print(f"   ✅ Created facility: {facility.facility_name}")
            else:
                facilities.append(existing_facility)
                print(f"   ✅ Facility already exists: {existing_facility.facility_name}")
        
        # Create Booking Requests
        print("\n📅 Creating booking requests...")
        booking_statuses = ["requested", "confirmed", "cancelled", "completed"]
        
        for i in range(15):  # Create 15 booking requests
            customer = random.choice(customers)
            room = random.choice(rooms) if random.choice([True, False]) else None
            facility = random.choice(facilities) if random.choice([True, False]) else None
            
            # Skip if neither room nor facility selected
            if not room and not facility:
                room = random.choice(rooms)
            
            booking_date = datetime.now(timezone.utc) + timedelta(days=random.randint(1, 30))
            check_in_date = booking_date + timedelta(hours=random.randint(1, 24))
            check_out_date = check_in_date + timedelta(days=random.randint(1, 7))
            
            existing_booking = db.query(TblBookingRequests).filter(
                TblBookingRequests.customer_id == customer.id,
                TblBookingRequests.booking_date == booking_date,
                TblBookingRequests.tenant_id == tenant_id,
                TblBookingRequests.deleted == 0
            ).first()
            
            if not existing_booking:
                booking = TblBookingRequests(
                    tenant_id=tenant_id,
                    customer_id=customer.id,
                    room_id=room.id if room else None,
                    facility_id=facility.id if facility else None,
                    mobile_number=customer.phone,
                    booking_date=booking_date,
                    check_in_date=check_in_date,
                    check_out_date=check_out_date,
                    status=random.choice(booking_statuses),
                    request_channel="zalo_chat",
                    note=f"Sample booking request {i+1}",
                    created_by="system",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(booking)
                db.commit()
                db.refresh(booking)
                
                booking_type = []
                if room:
                    booking_type.append(f"Room {room.room_name}")
                if facility:
                    booking_type.append(f"Facility {facility.facility_name}")
                
                print(f"   ✅ Created booking: {customer.name} - {', '.join(booking_type)}")
        
        print("\n🎉 Comprehensive sample data created successfully!")
        print(f"\n📊 Summary:")
        print(f"   • Hotel Brands: {len(hotel_brands)}")
        print(f"   • Rooms: {len(rooms)}")
        print(f"   • Customers: {len(customers)}")
        print(f"   • Facilities: {len(facilities)}")
        print(f"   • Booking Requests: Created multiple bookings")
        
        print(f"\n🔑 Access the API at: http://localhost:8000/docs")
        print(f"🔑 Login credentials:")
        print(f"   Super Admin: username=superadmin, password=admin123")
        print(f"   Hotel Admin: username=hoteladmin, password=admin123")
        
    except Exception as e:
        print(f"❌ Error creating comprehensive sample data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_comprehensive_sample_data()
