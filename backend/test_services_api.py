import requests
import json

# API base URL
BASE_URL = "http://localhost:8000/api/v1"

def test_login():
    """Test login to get token"""
    login_data = {
        "username": "hoteladmin",
        "password": "admin123"
    }
    
    # Use form data instead of JSON
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    print(f"Login status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Login response: {json.dumps(data, indent=2, ensure_ascii=False)}")
        
        # Check different response formats
        if data.get("status"):
            token = data["result"]["access_token"]
            tenant_id = data["result"]["tenant_id"]
            print(f"Login successful! Token: {token[:50]}...")
            print(f"Tenant ID: {tenant_id}")
            return token, tenant_id
        elif data.get("access_token"):
            # Direct token format
            token = data["access_token"]
            tenant_id = data.get("user_info", {}).get("tenant_id", 1)  # Get from user_info
            print(f"Login successful! Token: {token[:50]}...")
            print(f"Tenant ID: {tenant_id}")
            return token, tenant_id
        else:
            print(f"Login failed: {data.get('message')}")
    else:
        print(f"Login request failed: {response.text}")
    
    return None, None

def test_services_api(token, tenant_id):
    """Test services CRUD operations"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test GET services
    print("\n=== Testing GET services ===")
    response = requests.get(f"{BASE_URL}/services?tenant_id={tenant_id}", headers=headers)
    print(f"GET services status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        if isinstance(data, list):
            # Direct list response
            services = data
        else:
            # Wrapped in result
            services = data.get('result', [])
        
        print(f"Services count: {len(services)}")
        print(f"Services data: {json.dumps(services, indent=2, ensure_ascii=False)}")
    else:
        print(f"GET services failed: {response.text}")
    
    # Test POST service
    print("\n=== Testing POST service ===")
    service_data = {
        "tenant_id": tenant_id,
        "service_name": "Test Spa Service",
        "description": "A test spa service",
        "price": 500000,
        "type": "spa",
        "unit": "per person",
        "duration_minutes": 60,
        "requires_schedule": True
    }
    
    response = requests.post(f"{BASE_URL}/services?tenant_id={tenant_id}", 
                           json=service_data, headers=headers)
    print(f"POST service status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Created service: {json.dumps(data, indent=2, ensure_ascii=False)}")
        return data.get("result", {}).get("id")
    else:
        print(f"POST service failed: {response.text}")
        return None

if __name__ == "__main__":
    # Test login
    token, tenant_id = test_login()
    
    if token and tenant_id:
        # Test services API
        service_id = test_services_api(token, tenant_id)
        print(f"\nTest completed. Created service ID: {service_id}")
    else:
        print("Failed to get authentication token")
