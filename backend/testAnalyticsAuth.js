import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Test analytics with authentication
const testAnalyticsWithAuth = async () => {
  try {
    console.log('=== Testing Analytics with Authentication ===\n');

    // Login as Super Admin
    console.log('1. Logging in as Super Admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;
    console.log('✓ Login successful\n');

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    // Test all analytics endpoints
    console.log('2. Testing GET /api/analytics/all (7 days)...');
    const allResponse = await axios.get(`${API_BASE}/analytics/all?range=7`, { headers });
    console.log('✓ Success');
    console.log(`  - Total complaints: ${allResponse.data.overview.totalComplaints}`);
    console.log(`  - Resolved: ${allResponse.data.overview.resolvedComplaints}`);
    console.log(`  - Resolution Rate: ${allResponse.data.overview.resolutionRate}%`);
    console.log(`  - Avg Resolution Time: ${allResponse.data.overview.avgResolutionTime} hours\n`);

    console.log('3. Testing GET /api/analytics/by-category...');
    const categoryResponse = await axios.get(`${API_BASE}/analytics/by-category?range=7`, { headers });
    console.log('✓ Success');
    console.log(`  - Categories: ${categoryResponse.data.data.length}\n`);

    console.log('4. Testing GET /api/analytics/by-status...');
    const statusResponse = await axios.get(`${API_BASE}/analytics/by-status?range=7`, { headers });
    console.log('✓ Success');
    console.log(`  - Status groups: ${statusResponse.data.data.length}\n`);

    console.log('5. Testing GET /api/analytics/by-department...');
    const deptResponse = await axios.get(`${API_BASE}/analytics/by-department?range=7`, { headers });
    console.log('✓ Success');
    console.log(`  - Departments: ${deptResponse.data.data.length}\n`);

    console.log('6. Testing GET /api/analytics/trends...');
    const trendsResponse = await axios.get(`${API_BASE}/analytics/trends?range=7`, { headers });
    console.log('✓ Success');
    console.log(`  - Trend data points: ${trendsResponse.data.trends.length}\n`);

    console.log('7. Testing GET /api/analytics/officer-performance...');
    const officerResponse = await axios.get(`${API_BASE}/analytics/officer-performance?range=7`, { headers });
    console.log('✓ Success');
    console.log(`  - Officers: ${officerResponse.data.data.length}\n`);

    console.log('8. Testing custom date range...');
    const customResponse = await axios.get(`${API_BASE}/analytics/all`, {
      headers,
      params: {
        startDate: '2026-01-01',
        endDate: '2026-12-31'
      }
    });
    console.log('✓ Success');
    console.log(`  - Total complaints: ${customResponse.data.overview.totalComplaints}\n`);

    console.log('9. Testing unauthorized access (should fail)...');
    try {
      await axios.get(`${API_BASE}/analytics/all?range=7`);
      console.log('✗ Should have failed but succeeded\n');
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('✓ Unauthorized access correctly prevented\n');
      } else {
        console.log(`✗ Unexpected error: ${error.response?.status}\n`);
      }
    }

    console.log('=== All Analytics Tests Passed ===');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
};

testAnalyticsWithAuth();
