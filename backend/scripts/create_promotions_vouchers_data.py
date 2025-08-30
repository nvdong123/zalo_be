"""
Script to create sample promotions and vouchers data
Usage: python scripts/create_promotions_vouchers_data.py
"""
import sys
import os
from datetime import datetime, timezone, timedelta

# Add app directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session_local import SessionLocal
from app.models.models import TblTenants, TblPromotions, TblVouchers, TblServices
from sqlalchemy.orm import Session

def create_promotions_vouchers_data():
    """Create sample promotions and vouchers data"""
    db: Session = SessionLocal()
    
    try:
        print("🎯 Creating promotions and vouchers sample data...")
        
        # Get existing tenant
        tenant = db.query(TblTenants).filter(TblTenants.domain == "demo.hotel.com").first()
        if not tenant:
            print("❌ Please run create_sample_data.py first to create basic tenant")
            return
        
        tenant_id = tenant.id
        print(f"✅ Using tenant: {tenant.name} (ID: {tenant_id})")
        
        # Check if models exist (some might be missing from database)
        models_to_check = [
            ('TblPromotions', TblPromotions),
            ('TblVouchers', TblVouchers),
            ('TblServices', TblServices)
        ]
        
        available_models = []
        for name, model in models_to_check:
            try:
                # Try to query the table to see if it exists
                db.query(model).first()
                available_models.append((name, model))
                print(f"✅ {name} table exists")
            except Exception as e:
                print(f"⚠️ {name} table not found: {e}")
        
        # Create Promotions (if table exists)
        if any(name == 'TblPromotions' for name, _ in available_models):
            print("\n🎉 Creating promotions...")
            promotions_data = [
                {
                    "title": "Early Bird Discount",
                    "description": "Get 20% off for bookings made 30 days in advance",
                    "start_date": datetime.now(timezone.utc).date(),
                    "end_date": (datetime.now(timezone.utc) + timedelta(days=90)).date(),
                    "banner_image": "https://example.com/early-bird.jpg",
                    "status": "active"
                },
                {
                    "title": "Weekend Special",
                    "description": "Fixed $50 discount for weekend stays",
                    "start_date": datetime.now(timezone.utc).date(),
                    "end_date": (datetime.now(timezone.utc) + timedelta(days=60)).date(),
                    "banner_image": "https://example.com/weekend-special.jpg",
                    "status": "active"
                },
                {
                    "title": "Summer Package",
                    "description": "Stay 3 nights, get 1 night free",
                    "start_date": datetime.now(timezone.utc).date(),
                    "end_date": (datetime.now(timezone.utc) + timedelta(days=120)).date(),
                    "banner_image": "https://example.com/summer-package.jpg",
                    "status": "active"
                }
            ]
            
            for promo_data in promotions_data:
                existing_promo = db.query(TblPromotions).filter(
                    TblPromotions.title == promo_data["title"],
                    TblPromotions.tenant_id == tenant_id,
                    TblPromotions.deleted == 0
                ).first()
                
                if not existing_promo:
                    promotion = TblPromotions(
                        tenant_id=tenant_id,
                        **promo_data,
                        created_by="system",
                        created_at=datetime.now(timezone.utc)
                    )
                    db.add(promotion)
                    db.commit()
                    db.refresh(promotion)
                    print(f"   ✅ Created promotion: {promotion.title}")
                else:
                    print(f"   ✅ Promotion already exists: {existing_promo.title}")
        
        # Create Vouchers (if table exists)
        if any(name == 'TblVouchers' for name, _ in available_models):
            print("\n🎫 Creating vouchers...")
            vouchers_data = [
                {
                    "code": "WELCOME10",
                    "discount_type": "percentage",
                    "discount_value": 10.0,
                    "max_usage": 100,
                    "start_date": datetime.now(timezone.utc).date(),
                    "end_date": (datetime.now(timezone.utc) + timedelta(days=365)).date(),
                    "status": "active"
                },
                {
                    "code": "SAVE25",
                    "discount_type": "fixed",
                    "discount_value": 25.0,
                    "max_usage": 50,
                    "start_date": datetime.now(timezone.utc).date(),
                    "end_date": (datetime.now(timezone.utc) + timedelta(days=30)).date(),
                    "status": "active"
                },
                {
                    "code": "VIP50",
                    "discount_type": "percentage",
                    "discount_value": 50.0,
                    "max_usage": 10,
                    "start_date": datetime.now(timezone.utc).date(),
                    "end_date": (datetime.now(timezone.utc) + timedelta(days=90)).date(),
                    "status": "active"
                }
            ]
            
            for voucher_data in vouchers_data:
                existing_voucher = db.query(TblVouchers).filter(
                    TblVouchers.code == voucher_data["code"],
                    TblVouchers.tenant_id == tenant_id,
                    TblVouchers.deleted == 0
                ).first()
                
                if not existing_voucher:
                    voucher = TblVouchers(
                        tenant_id=tenant_id,
                        **voucher_data,
                        created_by="system",
                        created_at=datetime.now(timezone.utc)
                    )
                    db.add(voucher)
                    db.commit()
                    db.refresh(voucher)
                    print(f"   ✅ Created voucher: {voucher.code}")
                else:
                    print(f"   ✅ Voucher already exists: {existing_voucher.code}")
        
        # Create Services (if table exists)
        if any(name == 'TblServices' for name, _ in available_models):
            print("\n🛎️ Creating services...")
            services_data = [
                {
                    "service_name": "Airport Transfer",
                    "type": "Transportation",
                    "description": "Comfortable airport pickup and drop-off service",
                    "price": 50.0,
                    "unit": "trip",
                    "duration_minutes": 60,
                    "requires_schedule": True,
                    "image_url": "https://example.com/airport-transfer.jpg"
                },
                {
                    "service_name": "Spa Massage",
                    "type": "Wellness",
                    "description": "Relaxing full-body massage at our spa",
                    "price": 80.0,
                    "unit": "session",
                    "duration_minutes": 90,
                    "requires_schedule": True,
                    "image_url": "https://example.com/spa-massage.jpg"
                },
                {
                    "service_name": "Room Service",
                    "type": "Dining",
                    "description": "24/7 in-room dining service",
                    "price": 15.0,
                    "unit": "order",
                    "duration_minutes": 30,
                    "requires_schedule": False,
                    "image_url": "https://example.com/room-service.jpg"
                },
                {
                    "service_name": "Laundry Service",
                    "type": "Housekeeping", 
                    "description": "Professional laundry and dry cleaning",
                    "price": 25.0,
                    "unit": "bag",
                    "duration_minutes": 240,
                    "requires_schedule": True,
                    "image_url": "https://example.com/laundry.jpg"
                }
            ]
            
            for service_data in services_data:
                existing_service = db.query(TblServices).filter(
                    TblServices.service_name == service_data["service_name"],
                    TblServices.tenant_id == tenant_id,
                    TblServices.deleted == 0
                ).first()
                
                if not existing_service:
                    service = TblServices(
                        tenant_id=tenant_id,
                        **service_data,
                        created_by="system",
                        created_at=datetime.now(timezone.utc)
                    )
                    db.add(service)
                    db.commit()
                    db.refresh(service)
                    print(f"   ✅ Created service: {service.service_name}")
                else:
                    print(f"   ✅ Service already exists: {existing_service.service_name}")
        
        print("\n🎉 Promotions and vouchers sample data created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating promotions/vouchers data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_promotions_vouchers_data()
