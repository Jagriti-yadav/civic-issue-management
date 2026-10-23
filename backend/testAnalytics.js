import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Login as super admin to get token
const login = async () => {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
};

// Test analytics endpoints
const testAnalytics = async (token) => {
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  console.log('\n=== Testing Analytics API ===\n');

  // Test 1: Get all analytics
  console.log('1. Testing GET /api/analytics/all (7 days)');
  try {
    const response = await axios.get(`${API_BASE}/analytics/all?range=7`, { headers });
    console.log('✓ Success');
    console.log('  - Total complaints:', response.data.overview.totalComplaints);
    console.log('  - Resolved:', response.data.overview.resolvedComplaints);
    console.log('  - Pending:', response.data.overview.pendingComplaints);
    console.log('  - In Progress:', response.data.overview.inProgressComplaints);
    console.log('  - Rejected:', response.data.overview.rejectedComplaints);
    console.log('  - Resolution Rate:', response.data.overview.resolutionRate + '%');
    console.log('  - Avg Resolution Time:', response.data.overview.avgResolutionTime, response.data.overview.avgResolutionTimeUnit);
    console.log('  - Categories:', response.data.byCategory.length);
    console.log('  - Departments:', response.data.byDepartment.length);
    console.log('  - Trend data points:', response.data.trends.length);
    console.log('  - Officers with performance:', response.data.officerPerformance.length);
  } catch (error) {
    console.error('✗ Failed:', error.response?.data || error.message);
  }

  // Test 2: Get overview with 30 days
  console.log('\n2. Testing GET /api/analytics/overview (30 days)');
  try {
    const response = await axios.get(`${API_BASE}/analytics/overview?range=30`, { headers });
    console.log('✓ Success');
    console.log('  - Total complaints:', response.data.metrics.totalComplaints);
    console.log('  - Resolution Rate:', response.data.metrics.resolutionRate + '%');
  } catch (error) {
    console.error('✗ Failed:', error.response?.data || error.message);
  }

  // Test 3: Get by category
  console.log('\n3. Testing GET /api/analytics/by-category');
  try {
    const response = await axios.get(`${API_BASE}/analytics/by-category?range=7`, { headers });
    console.log('✓ Success');
    console.log('  - Categories found:', response.data.data.length);
    response.data.data.forEach(cat => {
      console.log(`    - ${cat.category}: ${cat.total} total, ${cat.resolved} resolved`);
    });
  } catch (error) {
    console.error('✗ Failed:', error.response?.data || error.message);
  }

  // Test 4: Get by status
  console.log('\n4. Testing GET /api/analytics/by-status');
  try {
    const response = await axios.get(`${API_BASE}/analytics/by-status?range=7`, { headers });
    console.log('✓ Success');
    console.log('  - Status groups:', response.data.data.length);
    response.data.data.forEach(status => {
      console.log(`    - ${status.status}: ${status.count}`);
    });
  } catch (error) {
    console.error('✗ Failed:', error.response?.data || error.message);
  }

  // Test 5: Get by department
  console.log('\n5. Testing GET /api/analytics/by-department');
  try {
    const response = await axios.get(`${API_BASE}/analytics/by-department?range=7`, { headers });
    console.log('✓ Success');
    console.log('  - Departments:', response.data.data.length);
    response.data.data.slice(0, 3).forEach(dept => {
      console.log(`    - ${dept.department}: ${dept.total} total, ${dept.resolved} resolved`);
    });
  } catch (error) {
    console.error('✗ Failed:', error.response?.data || error.message);
  }

  // Test 6: Get trends
  console.log('\n6. Testing GET /api/analytics/trends');
  try {
    const response = await axios.get(`${API_BASE}/analytics/trends?range=7`, { headers });
    console.log('✓ Success');
    console.log('  - Trend data points:', response.data.trends.length);
    console.log('  - Daily totals:', response.data.dailyTotals.length);
  } catch (error) {
    console.error('✗ Failed:', error.response?.data || error.message);
  }

  // Test 7: Get officer performance
  console.log('\n7. Testing GET /api/analytics/officer-performance');
  try {
    const response = await axios.get(`${API_BASE}/analytics/officer-performance?range=7`, { headers });
    console.log('✓ Success');
    console.log('  - Officers:', response.data.data.length);
    response.data.data.forEach(officer => {
      console.log(`    - ${officer.officerName}: ${officer.totalAssigned} assigned, ${officer.resolved} resolved (${officer.resolutionRate}%)`);
    });
  } catch (error) {
    console.error('✗ Failed:', error.response?.data || error.message);
  }

  // Test 8: Custom date range
  console.log('\n8. Testing GET /api/analytics/all (custom date range)');
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();

    const response = await axios.get(`${API_BASE}/analytics/all`, {
      headers,
      params: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }
    });
    console.log('✓ Success');
    console.log('  - Date range:', response.data.dateRange.preset);
    console.log('  - Total complaints:', response.data.overview.totalComplaints);
  } catch (error) {
    console.error('✗ Failed:', error.response?.data || error.message);
  }

  // Test 9: Unauthorized access (should fail)
  console.log('\n9. Testing unauthorized access (should fail)');
  try {
    await axios.get(`${API_BASE}/analytics/all?range=7`);
    console.error('✗ Should have failed but succeeded');
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('✓ Correctly rejected unauthorized access');
    } else {
      console.error('✗ Unexpected error:', error.response?.data || error.message);
    }
  }

  console.log('\n=== Analytics API Tests Complete ===\n');
};

const main = async () => {
  try {
    const token = await login();
    await testAnalytics(token);
  } catch (error) {
    console.error('Test suite failed:', error.message);
    process.exit(1);
  }
};

main();
