"""
Script to test API endpoints with sample data
Usage: python scripts/test_apis.py
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_login():
    """Test admin login"""
    login_data = {
        "username": "hoteladmin",
        "password": "admin123"
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/auth/login", data=login_data)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login successful! Token: {data['access_token'][:50]}...")
        return data['access_token']
    else:
        print(f"❌ Login failed: {response.text}")
        return None

def test_api_with_auth(token):
    """Test various API endpoints with authentication"""
    headers = {"Authorization": f"Bearer {token}"}
    tenant_id = 4  # Demo Hotel tenant ID
    
    # Test endpoints
    endpoints = [
        ("Hotel Brands", f"/api/v1/hotel-brands?tenant_id={tenant_id}"),
        ("Rooms", f"/api/v1/rooms?tenant_id={tenant_id}"),
        ("Customers", f"/api/v1/customers?tenant_id={tenant_id}"),
        ("Facilities", f"/api/v1/facilities?tenant_id={tenant_id}"),
        ("Booking Requests", f"/api/v1/booking-requests?tenant_id={tenant_id}")
    ]
    
    for name, endpoint in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                count = len(data) if isinstance(data, list) else len(data.get('items', []))
                print(f"✅ {name}: {count} items found")
            else:
                print(f"❌ {name}: Failed - {response.status_code}")
        except Exception as e:
            print(f"❌ {name}: Error - {e}")

def main():
    print("🧪 Testing API endpoints...")
    
    # Test login
    token = test_login()
    if not token:
        return
    
    # Test authenticated endpoints
    test_api_with_auth(token)
    
    print("\n🎉 API testing completed!")
    print("📖 Full API documentation: http://localhost:8000/docs")

if __name__ == "__main__":
    main()
