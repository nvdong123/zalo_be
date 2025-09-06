#!/usr/bin/env python3
import requests
import json

# Test create service API directly
url = "http://localhost:8000/api/v1/services"

# First login to get token
login_url = "http://localhost:8000/api/v1/auth/login"
login_data = {
    "username": "hoteladmin",
    "password": "admin123"
}

print("=== Testing Service Create API ===")

# Login
print("1. Logging in...")
response = requests.post(login_url, data=login_data)
print(f"Login status: {response.status_code}")

if response.status_code == 200:
    auth_data = response.json()
    token = auth_data.get("access_token")
    tenant_id = auth_data.get("tenant_info", {}).get("id") or auth_data.get("user_info", {}).get("tenant_id")
    
    print(f"Token: {token[:50]}...")
    print(f"Tenant ID: {tenant_id}")
    
    if token and tenant_id:
        # Test create service
        print("\n2. Testing create service...")
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "X-Tenant-Id": str(tenant_id)
        }
        
        service_data = {
            "service_name": "Test Service",
            "description": "Test description",
            "price": 100000,
            "type": "spa",
            "unit": "session",
            "duration_minutes": 60,
            "requires_schedule": True
        }
        
        params = {"tenant_id": tenant_id}
        
        print(f"Headers: {headers}")
        print(f"Params: {params}")
        print(f"Data: {json.dumps(service_data, indent=2)}")
        
        response = requests.post(url, params=params, headers=headers, json=service_data)
        print(f"\nCreate service status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 422:
            print("\n=== 422 Validation Error Details ===")
            try:
                error_detail = response.json()
                print(json.dumps(error_detail, indent=2))
            except:
                print("Could not parse error response")
    else:
        print("Failed to get token or tenant_id from login")
else:
    print(f"Login failed: {response.text}")
