// Test User Management APIs
// This script requires the backend server to be running

const API_BASE = 'http://localhost:5000/api';

// Test data - replace with actual token after login
let authToken = '';

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    ...options.headers
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testLogin() {
  console.log('\n--- Testing Login ---');
  const result = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@smartcivic.com',
      password: 'admin123'
    })
  });

  if (result.success) {
    authToken = result.data.token;
    console.log('✓ Login successful');
    console.log('  User:', result.data.user.name);
    console.log('  Role:', result.data.user.role);
    console.log('  Token received');
  } else {
    console.log('✗ Login failed:', result.data.message || result.error);
  }
  return result.success;
}

async function testGetAllUsers() {
  console.log('\n--- Testing Get All Users ---');
  const result = await makeRequest('/users/all?page=1&limit=10');

  if (result.success) {
    console.log('✓ Get all users successful');
    console.log(`  Total users: ${result.data.pagination.total}`);
    console.log(`  Users returned: ${result.data.users.length}`);
    result.data.users.forEach((user, i) => {
      console.log(`  ${i + 1}. ${user.name} (${user.role}) - ${user.isActive ? 'Active' : 'Inactive'}`);
    });
  } else {
    console.log('✗ Get all users failed:', result.data.message || result.error);
  }
  return result.success;
}

async function testUserSearch() {
  console.log('\n--- Testing User Search ---');
  const result = await makeRequest('/users/all?search=citizen&page=1&limit=10');

  if (result.success) {
    console.log('✓ User search successful');
    console.log(`  Found ${result.data.users.length} users matching "citizen"`);
  } else {
    console.log('✗ User search failed:', result.data.message || result.error);
  }
  return result.success;
}

async function testUserFilters() {
  console.log('\n--- Testing User Filters ---');
  const result = await makeRequest('/users/all?status=active&role=citizen&page=1&limit=10');

  if (result.success) {
    console.log('✓ User filters successful');
    console.log(`  Found ${result.data.users.length} active citizens`);
  } else {
    console.log('✗ User filters failed:', result.data.message || result.error);
  }
  return result.success;
}

async function testGetUserById() {
  console.log('\n--- Testing Get User By ID ---');
  // First get a user ID from the list
  const usersResult = await makeRequest('/users/all?page=1&limit=1');
  if (!usersResult.success || usersResult.data.users.length === 0) {
    console.log('✗ Cannot test get user by ID - no users found');
    return false;
  }

  const userId = usersResult.data.users[0]._id;
  const result = await makeRequest(`/users/${userId}`);

  if (result.success) {
    console.log('✓ Get user by ID successful');
    console.log(`  User: ${result.data.user.name}`);
    console.log(`  Email: ${result.data.user.email}`);
  } else {
    console.log('✗ Get user by ID failed:', result.data.message || result.error);
  }
  return result.success;
}

async function testGetUserComplaints() {
  console.log('\n--- Testing Get User Complaints ---');
  // First get a citizen user ID
  const usersResult = await makeRequest('/users/all?role=citizen&page=1&limit=1');
  if (!usersResult.success || usersResult.data.users.length === 0) {
    console.log('✗ Cannot test get user complaints - no citizen users found');
    return false;
  }

  const userId = usersResult.data.users[0]._id;
  const result = await makeRequest(`/users/${userId}/complaints?page=1&limit=10`);

  if (result.success) {
    console.log('✓ Get user complaints successful');
    console.log(`  User: ${result.data.user.name}`);
    console.log(`  Complaints: ${result.data.complaints.length}`);
  } else {
    console.log('✗ Get user complaints failed:', result.data.message || result.error);
  }
  return result.success;
}

async function testUpdateUserStatus() {
  console.log('\n--- Testing Update User Status ---');
  // First get a citizen user (not admin)
  const usersResult = await makeRequest('/users/all?role=citizen&page=1&limit=1');
  if (!usersResult.success || usersResult.data.users.length === 0) {
    console.log('✗ Cannot test update user status - no citizen users found');
    return false;
  }

  const userId = usersResult.data.users[0]._id;
  const user = usersResult.data.users[0];
  const newStatus = !user.isActive;

  const result = await makeRequest(`/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive: newStatus })
  });

  if (result.success) {
    console.log('✓ Update user status successful');
    console.log(`  User ${newStatus ? 'activated' : 'deactivated'}`);

    // Revert the change
    await makeRequest(`/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: user.isActive })
    });
    console.log('  Status reverted for testing');
  } else {
    console.log('✗ Update user status failed:', result.data.message || result.error);
  }
  return result.success;
}

async function runTests() {
  console.log('=== User Management API Tests ===');
  console.log('Make sure backend server is running on http://localhost:5000');

  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without authentication');
    console.log('Please ensure:');
    console.log('1. Backend server is running');
    console.log('2. Admin user exists with email: admin@smartcivic.com');
    console.log('3. Password is: admin123');
    process.exit(1);
  }

  await testGetAllUsers();
  await testUserSearch();
  await testUserFilters();
  await testGetUserById();
  await testGetUserComplaints();
  await testUpdateUserStatus();

  console.log('\n=== All Tests Complete ===');
}

runTests().catch(console.error);
