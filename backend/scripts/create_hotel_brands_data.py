"""
Script to create sample hotel brands data
Usage: python scripts/create_hotel_brands_data.py
"""
import sys
import os
from datetime import datetime, timezone

# Add app directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session_local import SessionLocal
from app.models.models import TblHotelBrands, TblTenants
from sqlalchemy.orm import Session

def create_hotel_brands_data():
    """Create sample hotel brands for development"""
    db: Session = SessionLocal()
    
    try:
        # Get first tenant
        tenant = db.query(TblTenants).filter(TblTenants.deleted == 0).first()
        if not tenant:
            print("❌ No tenant found. Please create tenant first.")
            return
        
        print(f"🏢 Using tenant: {tenant.name} (ID: {tenant.id})")
        
        # Sample hotel brands data
        brands_data = [
            {
                "hotel_name": "Luxury Resort Hotels",
                "slogan": "Nghỉ dưỡng đẳng cấp thế giới",
                "description": "Chuỗi khách sạn resort cao cấp với dịch vụ 5 sao",
                "logo_url": "https://example.com/logos/luxury-resort.png",
                "website_url": "https://luxury-resort.com",
                "email": "contact@luxury-resort.com",
                "phone_number": "+84 123 456 789",
                "address": "123 Đường Biển, Phường 1",
                "city": "Đà Nẵng",
                "country": "Vietnam"
            },
            {
                "hotel_name": "Business Center Hotels",
                "slogan": "Dịch vụ chuyên nghiệp cho doanh nhân",
                "description": "Khách sạn kinh doanh hiện đại phục vụ doanh nhân",
                "logo_url": "https://example.com/logos/business-center.png", 
                "website_url": "https://business-center.com",
                "email": "info@business-center.com",
                "phone_number": "+84 987 654 321",
                "address": "456 Đường Nguyễn Huệ, Quận 1",
                "city": "TP.HCM",
                "country": "Vietnam"
            },
            {
                "hotel_name": "Budget Friendly Inns",
                "slogan": "Tiết kiệm mà chất lượng",
                "description": "Chuỗi khách sạn bình dân với giá cả phải chăng",
                "logo_url": "https://example.com/logos/budget-inns.png",
                "website_url": "https://budget-inns.com",
                "email": "support@budget-inns.com", 
                "phone_number": "+84 555 123 456",
                "address": "789 Đường Lê Lợi, Quận 3",
                "city": "TP.HCM",
                "country": "Vietnam"
            },
            {
                "hotel_name": "Boutique City Hotels",
                "slogan": "Phong cách độc đáo giữa lòng thành phố",
                "description": "Khách sạn boutique độc đáo tại trung tâm thành phố",
                "logo_url": "https://example.com/logos/boutique-city.png",
                "website_url": "https://boutique-city.com",
                "email": "hello@boutique-city.com",
                "phone_number": "+84 333 789 012",
                "address": "321 Đường Trần Hưng Đạo, Quận 5",
                "city": "TP.HCM",
                "country": "Vietnam"
            },
            {
                "hotel_name": "Seaside Paradise Resorts",
                "slogan": "Thiên đường bên bờ biển",
                "description": "Resort nghỉ dưỡng bên bờ biển với view tuyệt đẹp",
                "logo_url": "https://example.com/logos/seaside-paradise.png",
                "website_url": "https://seaside-paradise.com",
                "email": "reservation@seaside-paradise.com",
                "phone_number": "+84 777 888 999",
                "address": "555 Đường Võ Nguyên Giáp, Sơn Trà",
                "city": "Đà Nẵng",
                "country": "Vietnam"
            }
        ]
        
        created_count = 0
        for brand_data in brands_data:
            # Check if brand already exists
            existing_brand = db.query(TblHotelBrands).filter(
                TblHotelBrands.hotel_name == brand_data["hotel_name"],
                TblHotelBrands.tenant_id == tenant.id,
                TblHotelBrands.deleted == 0
            ).first()
            
            if not existing_brand:
                brand = TblHotelBrands(
                    hotel_name=brand_data["hotel_name"],
                    slogan=brand_data.get("slogan"),
                    description=brand_data.get("description"),
                    logo_url=brand_data.get("logo_url"),
                    website_url=brand_data.get("website_url"),
                    email=brand_data.get("email"),
                    phone_number=brand_data.get("phone_number"),
                    address=brand_data.get("address"),
                    city=brand_data.get("city"),
                    country=brand_data.get("country"),
                    tenant_id=tenant.id,
                    created_at=datetime.now(timezone.utc),
                    deleted=0
                )
                db.add(brand)
                created_count += 1
                print(f"✅ Created hotel brand: {brand_data['hotel_name']}")
            else:
                print(f"ℹ️ Hotel brand already exists: {brand_data['hotel_name']}")
        
        db.commit()
        print(f"\n🎉 Successfully created {created_count} hotel brands!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_hotel_brands_data()
