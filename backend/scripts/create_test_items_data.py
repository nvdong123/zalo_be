"""
Script to insert sample data for test_items table - for Zalo app testing
"""

from sqlalchemy.orm import Session
from app.db.session_local import SessionLocal
from app.models.models import TblTestItems

def create_sample_test_items():
    db = SessionLocal()
    try:
        # Check if test items already exist
        existing_items = db.query(TblTestItems).count()
        if existing_items > 0:
            print(f"✅ Test items already exist: {existing_items} items")
            return
        
        # Sample test items for Zalo app
        sample_items = [
            {
                "name": "Phòng Deluxe Ocean View",
                "description": "Phòng cao cấp với view biển tuyệt đẹp, diện tích 35m²",
                "price": 2500000,
                "image_url": "https://example.com/room1.jpg",
                "status": "active"
            },
            {
                "name": "Phòng Superior Garden View", 
                "description": "Phòng tiêu chuẩn view vườn, diện tích 28m²",
                "price": 1800000,
                "image_url": "https://example.com/room2.jpg",
                "status": "active"
            },
            {
                "name": "Suite Executive",
                "description": "Phòng suite sang trọng với phòng khách riêng, diện tích 55m²",
                "price": 4500000,
                "image_url": "https://example.com/suite.jpg", 
                "status": "active"
            },
            {
                "name": "Spa Massage Thư Giãn",
                "description": "Dịch vụ massage toàn thân với tinh dầu thiên nhiên - 90 phút",
                "price": 800000,
                "image_url": "https://example.com/spa.jpg",
                "status": "active"
            },
            {
                "name": "Buffet Sáng Quốc Tế",
                "description": "Buffet sáng phong phú với món Á - Âu tại nhà hàng chính",
                "price": 350000,
                "image_url": "https://example.com/breakfast.jpg",
                "status": "active"
            }
        ]
        
        # Insert sample data
        for item_data in sample_items:
            test_item = TblTestItems(**item_data)
            db.add(test_item)
        
        db.commit()
        print(f"✅ Created {len(sample_items)} sample test items for Zalo app")
        
        # Display created items
        print("\n📋 Sample test items:")
        for i, item in enumerate(sample_items, 1):
            print(f"  {i}. {item['name']} - {item['price']:,} VNĐ")
        
    except Exception as e:
        print(f"❌ Error creating sample test items: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Creating sample test items for Zalo app...")
    create_sample_test_items()
    print("✅ Done!")
