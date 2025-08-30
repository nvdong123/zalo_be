#!/usr/bin/env python3
"""
Script to create sample booking requests data
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.models import TblBookingRequests, TblCustomers, TblRooms
from datetime import datetime, date, timedelta
import random

def create_sample_booking_requests():
    db: Session = SessionLocal()
    
    try:
        # Giả sử tenant_id = 1 (Grand Hotel)
        tenant_id = 1
        
        # Kiểm tra xem đã có booking requests chưa
        existing = db.query(TblBookingRequests).filter(
            TblBookingRequests.tenant_id == tenant_id,
            TblBookingRequests.deleted == 0
        ).first()
        
        if existing:
            print("Sample booking requests already exist!")
            return

        # Lấy customers và rooms có sẵn
        customers = db.query(TblCustomers).filter(
            TblCustomers.tenant_id == tenant_id,
            TblCustomers.deleted == 0
        ).all()
        
        rooms = db.query(TblRooms).filter(
            TblRooms.tenant_id == tenant_id,
            TblRooms.deleted == 0
        ).all()

        if not customers:
            print("No customers found! Please run create_sample_customers.py first")
            return
            
        if not rooms:
            print("No rooms found! Please run create_sample_rooms.py first")
            return

        # Tạo booking requests với ngày khác nhau
        base_date = date.today()
        statuses = ['requested', 'confirmed', 'checked_in', 'checked_out', 'cancelled']
        channels = ['zalo_chat', 'external_link']

        sample_bookings = []
        for i in range(15):
            customer = random.choice(customers)
            room = random.choice(rooms)
            
            booking_date = base_date - timedelta(days=random.randint(0, 30))
            check_in_date = booking_date + timedelta(days=random.randint(1, 7))
            check_out_date = check_in_date + timedelta(days=random.randint(1, 5))
            
            sample_bookings.append({
                "tenant_id": tenant_id,
                "customer_id": customer.id,
                "room_id": room.id,
                "mobile_number": customer.phone or f"090{random.randint(1000000, 9999999)}",
                "booking_date": booking_date,
                "check_in_date": check_in_date,
                "check_out_date": check_out_date,
                "note": f"Đặt phòng từ khách hàng {customer.name}",
                "request_channel": random.choice(channels),
                "status": random.choice(statuses),
                "created_by": "system"
            })

        for booking_data in sample_bookings:
            booking = TblBookingRequests(**booking_data)
            db.add(booking)

        db.commit()
        print(f"✅ Created {len(sample_bookings)} sample booking requests successfully!")
        
        # Hiển thị bookings đã tạo
        bookings = db.query(TblBookingRequests).filter(
            TblBookingRequests.tenant_id == tenant_id,
            TblBookingRequests.deleted == 0
        ).all()
        
        print(f"\n📋 Created booking requests:")
        for idx, booking in enumerate(bookings, 1):
            customer = db.query(TblCustomers).filter(TblCustomers.id == booking.customer_id).first()
            room = db.query(TblRooms).filter(TblRooms.id == booking.room_id).first()
            print(f"{idx:2d}. {customer.name if customer else 'N/A'} - {room.room_name if room else 'N/A'} - {booking.status} - {booking.check_in_date}")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_booking_requests()
