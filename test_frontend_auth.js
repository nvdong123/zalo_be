// Test authentication and services API directly in browser console

// Step 1: Check current auth state
console.log('=== Current Auth State ===');
console.log('Local storage auth:', localStorage.getItem('hotel_auth'));
console.log('Local storage token:', localStorage.getItem('token'));

// Step 2: Test login
const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'username=hoteladmin&password=admin123'
    });
    
    const data = await response.json();
    console.log('=== Login Response ===');
    console.log('Status:', response.status);
    console.log('Data:', data);
    
    if (data.access_token) {
      // Decode JWT
      const tokenParts = data.access_token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      console.log('=== JWT Payload ===');
      console.log(payload);
      
      return { token: data.access_token, tenantId: payload.tenant_id };
    }
  } catch (error) {
    console.error('Login error:', error);
  }
  return null;
};

// Step 3: Test services API with correct headers
const testServicesAPI = async (token, tenantId) => {
  try {
    console.log('=== Testing Services API ===');
    console.log('Using token:', token.substring(0, 50) + '...');
    console.log('Using tenant ID:', tenantId);
    
    const response = await fetch(`http://localhost:8000/api/v1/services?tenant_id=${tenantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-Id': tenantId.toString(),
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Services API Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Services Data:', data);
      return data;
    } else {
      const errorText = await response.text();
      console.error('Services API Error:', errorText);
    }
  } catch (error) {
    console.error('Services API request error:', error);
  }
  return null;
};

// Run the test
const runTest = async () => {
  const loginResult = await testLogin();
  if (loginResult) {
    await testServicesAPI(loginResult.token, loginResult.tenantId);
  }
};

// Execute
runTest();
