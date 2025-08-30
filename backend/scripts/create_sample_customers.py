#!/usr/bin/env python3
"""
Script to create sample customers data
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.models import TblCustomers
from datetime import datetime

def create_sample_customers():
    db: Session = SessionLocal()
    
    try:
        # Giả sử tenant_id = 1 (Grand Hotel)
        tenant_id = 1
        
        # Kiểm tra xem đã có customers chưa
        existing = db.query(TblCustomers).filter(
            TblCustomers.tenant_id == tenant_id,
            TblCustomers.deleted == 0
        ).first()
        
        if existing:
            print("Sample customers already exist!")
            return

        sample_customers = [
            {
                "tenant_id": tenant_id,
                "zalo_user_id": "zalo_001",
                "name": "Nguyễn Văn An",
                "phone": "0901234567",
                "email": "nguyen.van.an@example.com",
                "created_by": "system"
            },
            {
                "tenant_id": tenant_id,
                "zalo_user_id": "zalo_002", 
                "name": "Trần Thị Bình",
                "phone": "0912345678",
                "email": "tran.thi.binh@example.com",
                "created_by": "system"
            },
            {
                "tenant_id": tenant_id,
                "zalo_user_id": "zalo_003",
                "name": "Lê Minh Cường", 
                "phone": "0923456789",
                "email": "le.minh.cuong@example.com",
                "created_by": "system"
            },
            {
                "tenant_id": tenant_id,
                "zalo_user_id": "zalo_004",
                "name": "Phạm Thị Dung",
                "phone": "0934567890",
                "email": "pham.thi.dung@example.com", 
                "created_by": "system"
            },
            {
                "tenant_id": tenant_id,
                "zalo_user_id": "zalo_005",
                "name": "Hoàng Văn Em",
                "phone": "0945678901",
                "email": "hoang.van.em@example.com",
                "created_by": "system"
            },
            {
                "tenant_id": tenant_id,
                "zalo_user_id": "zalo_006",
                "name": "Võ Thị Phượng",
                "phone": "0956789012",
                "email": "vo.thi.phuong@example.com",
                "created_by": "system"
            },
            {
                "tenant_id": tenant_id,
                "zalo_user_id": "zalo_007",
                "name": "Đặng Minh Giang",
                "phone": "0967890123",
                "email": "dang.minh.giang@example.com",
                "created_by": "system"
            },
            {
                "tenant_id": tenant_id,
                "zalo_user_id": "zalo_008",
                "name": "Bùi Thị Hạnh",
                "phone": "0978901234",
                "email": "bui.thi.hanh@example.com",
                "created_by": "system"
            },
            {
                "tenant_id": tenant_id,
                "zalo_user_id": "zalo_009",
                "name": "Đinh Văn Ích",
                "phone": "0989012345",
                "email": "dinh.van.ich@example.com",
                "created_by": "system"
            },
            {
                "tenant_id": tenant_id,
                "zalo_user_id": "zalo_010",
                "name": "Lý Thị Kim",
                "phone": "0990123456",
                "email": "ly.thi.kim@example.com",
                "created_by": "system"
            }
        ]

        for customer_data in sample_customers:
            customer = TblCustomers(**customer_data)
            db.add(customer)

        db.commit()
        print(f"✅ Created {len(sample_customers)} sample customers successfully!")
        
        # Hiển thị customers đã tạo
        customers = db.query(TblCustomers).filter(
            TblCustomers.tenant_id == tenant_id,
            TblCustomers.deleted == 0
        ).all()
        
        print("\n📋 Created customers:")
        for idx, customer in enumerate(customers, 1):
            print(f"{idx:2d}. {customer.name} - {customer.phone} - {customer.email}")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_customers()
