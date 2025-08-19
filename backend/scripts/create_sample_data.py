"""
Script to create sample admin users and tenants for development
Usage: python scripts/create_sample_data.py
"""
import sys
import os
from datetime import datetime, timezone

# Add app directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session_local import SessionLocal
from app.models.models import TblAdminUsers, TblTenants
from app.crud.crud_admin_users import crud_admin_user
from sqlalchemy.orm import Session

def create_sample_data():
    """Create sample tenants and admin users for development"""
    db: Session = SessionLocal()
    
    try:
        # Create sample tenant
        existing_tenant = db.query(TblTenants).filter(TblTenants.domain == "demo.hotel.com").first()
        if not existing_tenant:
            tenant = TblTenants(
                name="Demo Hotel",
                domain="demo.hotel.com",
                status="active",
                created_at=datetime.now(timezone.utc)
            )
            db.add(tenant)
            db.commit()
            db.refresh(tenant)
            print(f"✅ Created tenant: {tenant.name} (ID: {tenant.id})")
        else:
            tenant = existing_tenant
            print(f"✅ Tenant already exists: {tenant.name} (ID: {tenant.id})")
        
        # Create super admin
        existing_super_admin = db.query(TblAdminUsers).filter(TblAdminUsers.username == "superadmin").first()
        if not existing_super_admin:
            super_admin = TblAdminUsers(
                username="superadmin",
                email="superadmin@hotel.com", 
                hashed_password=crud_admin_user.get_password_hash("admin123"),
                role="super_admin",
                status="active",
                tenant_id=None,  # Super admin doesn't belong to any tenant
                created_at=datetime.now(timezone.utc)
            )
            db.add(super_admin)
            db.commit()
            print(f"✅ Created super admin: {super_admin.username}")
        else:
            print(f"✅ Super admin already exists: {existing_super_admin.username}")
        
        # Create hotel admin for demo tenant
        existing_hotel_admin = db.query(TblAdminUsers).filter(TblAdminUsers.username == "hoteladmin").first()
        if not existing_hotel_admin:
            hotel_admin = TblAdminUsers(
                username="hoteladmin",
                email="hoteladmin@demo.hotel.com",
                hashed_password=crud_admin_user.get_password_hash("admin123"),
                role="hotel_admin",
                status="active",
                tenant_id=tenant.id,
                created_at=datetime.now(timezone.utc)
            )
            db.add(hotel_admin)
            db.commit()
            print(f"✅ Created hotel admin: {hotel_admin.username} for tenant {tenant.name}")
        else:
            print(f"✅ Hotel admin already exists: {existing_hotel_admin.username}")
            
        print("\n🎉 Sample data created successfully!")
        print("\n🔑 Login credentials:")
        print("Super Admin: username=superadmin, password=admin123")
        print("Hotel Admin: username=hoteladmin, password=admin123")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()
