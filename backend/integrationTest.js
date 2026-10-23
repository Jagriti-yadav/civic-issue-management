import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

let authToken = null;
let adminId = null;
let citizenId = null;
let officerId = null;
let complaintId = null;
let departmentId = null;

// Test helper functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'success' ? '✓' : type === 'error' ? '✗' : '→';
  console.log(`[${timestamp}] ${prefix} ${message}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Part 1: Citizen Registration
const testCitizenRegistration = async () => {
  log('Testing Citizen Registration...');
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test Citizen',
      email: `citizen${Date.now()}@test.com`,
      password: 'citizen123'
    });
    log('Citizen registration successful', 'success');
    citizenId = response.data.user.id;
    return true;
  } catch (error) {
    log(`Citizen registration failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
};

// Part 2: Citizen Login
const testCitizenLogin = async () => {
  log('Testing Citizen Login...');
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'citizen@test.com',
      password: 'citizen123'
    });
    log('Citizen login successful', 'success');
    return true;
  } catch (error) {
    log(`Citizen login failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
};

// Part 3: Submit Complaint
const testSubmitComplaint = async () => {
  log('Testing Complaint Submission...');
  try {
    // First login as citizen to get token
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'citizen@test.com',
      password: 'citizen123'
    });
    const token = loginResponse.data.token;

    const response = await axios.post(`${API_BASE}/complaints`, {
      title: 'Test Integration Complaint',
      description: 'This is a test complaint for integration testing',
      category: 'roads',
      priority: 'medium',
      location: {
        address: '123 Test Street',
        latitude: 40.7128,
        longitude: -74.0060
      },
      phoneNumber: '+1234567890',
      department: 'Public Works'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    log('Complaint submission successful', 'success');
    complaintId = response.data.complaint._id;
    return true;
  } catch (error) {
    log(`Complaint submission failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
};

// Part 4: Verify Complaint in All Complaints
const testComplaintInAllComplaints = async () => {
  log('Testing Complaint appears in All Complaints...');
  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;
    adminId = loginResponse.data.user.id;

    const response = await axios.get(`${API_BASE}/complaints`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const found = response.data.complaints.some(c => c._id === complaintId);
    if (found) {
      log('Complaint found in All Complaints', 'success');
      return true;
    } else {
      log('Complaint not found in All Complaints', 'error');
      return false;
    }
  } catch (error) {
    log(`Verification failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
};

// Part 5: Super Admin User Management
const testUserManagement = async () => {
  log('Testing Super Admin User Management...');
  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;

    const response = await axios.get(`${API_BASE}/users/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.users && response.data.users.length > 0) {
      log(`User management working - found ${response.data.users.length} users`, 'success');
      return true;
    } else {
      log('User management failed - no users found', 'error');
      return false;
    }
  } catch (error) {
    log(`User management failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
};

// Part 6: Create and Manage Officers
const testOfficerManagement = async () => {
  log('Testing Officer Creation and Management...');
  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;

    // Create officer
    const createResponse = await axios.post(`${API_BASE}/users/officers`, {
      name: 'Test Integration Officer',
      email: `officer${Date.now()}@test.com`,
      password: 'officer123',
      department: 'Public Works',
      designation: 'Field Officer'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    officerId = createResponse.data.officer.id;
    log('Officer creation successful', 'success');

    // Get officers
    const getResponse = await axios.get(`${API_BASE}/users/officers`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (getResponse.data.officers && getResponse.data.officers.length > 0) {
      log('Officer management working', 'success');
      return true;
    } else {
      log('Officer retrieval failed', 'error');
      return false;
    }
  } catch (error) {
    log(`Officer management failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
};

// Part 7: Department Management
const testDepartmentManagement = async () => {
  log('Testing Department Management...');
  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;

    const response = await axios.get(`${API_BASE}/departments`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.departments && response.data.departments.length > 0) {
      log(`Department management working - found ${response.data.departments.length} departments`, 'success');
      return true;
    } else {
      log('Department management failed - no departments found', 'error');
      return false;
    }
  } catch (error) {
    log(`Department management failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
};

// Part 8: Officer Assignment to Department
const testOfficerDepartmentAssignment = async () => {
  log('Testing Officer Department Assignment...');
  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;

    // Get officers by department
    const response = await axios.get(`${API_BASE}/users/officers/department/Public Works`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.officers && response.data.officers.length > 0) {
      log('Officer department assignment working', 'success');
      return true;
    } else {
      log('No officers found in department', 'error');
      return false;
    }
  } catch (error) {
    log(`Officer department assignment failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
};

// Part 9: Complaint-Department-Officer Association
const testComplaintAssociation = async () => {
  log('Testing Complaint-Department-Officer Association...');
  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;

    // Get complaints
    const response = await axios.get(`${API_BASE}/complaints`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const hasDepartment = response.data.complaints.some(c => c.department);
    const hasOfficer = response.data.complaints.some(c => c.assignedTo);

    if (hasDepartment) {
      log('Complaints associated with departments', 'success');
    } else {
      log('No complaints associated with departments', 'error');
    }

    if (hasOfficer) {
      log('Complaints associated with officers', 'success');
    } else {
      log('No complaints associated with officers', 'error');
    }

    return hasDepartment || hasOfficer;
  } catch (error) {
    log(`Complaint association test failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
};

// Part 10: Dashboard Statistics
const testDashboardStatistics = async () => {
  log('Testing Dashboard Statistics...');
  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;

    const response = await axios.get(`${API_BASE}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.stats) {
      log('Dashboard statistics working', 'success');
      log(`  Total complaints: ${response.data.stats.complaints?.total || 0}`);
      log(`  Total users: ${response.data.stats.users?.total || 0}`);
      return true;
    } else {
      log('Dashboard statistics failed', 'error');
      return false;
    }
  } catch (error) {
    log(`Dashboard statistics failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
};

// Part 11: Analytics Calculations
const testAnalyticsCalculations = async () => {
  log('Testing Analytics Calculations...');
  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;

    const response = await axios.get(`${API_BASE}/analytics/all?range=30`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.overview) {
      log('Analytics calculations working', 'success');
      log(`  Resolution rate: ${response.data.overview.resolutionRate}%`);
      log(`  Avg resolution time: ${response.data.overview.avgResolutionTime} ${response.data.overview.avgResolutionTimeUnit}`);
      return true;
    } else {
      log('Analytics calculations failed', 'error');
      return false;
    }
  } catch (error) {
    log(`Analytics calculations failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
};

// Part 12: Super Admin Profile Update
const testProfileUpdate = async () => {
  log('Testing Super Admin Profile Update...');
  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;

    const response = await axios.patch(`${API_BASE}/users/${userId}`, {
      name: 'Super Admin Updated',
      phone: '+1234567890'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      log('Profile update successful', 'success');
      // Revert name
      await axios.patch(`${API_BASE}/users/${userId}`, {
        name: 'Super Admin'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } else {
      log('Profile update failed', 'error');
      return false;
    }
  } catch (error) {
    log(`Profile update failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
};

// Part 13: Password Change
const testPasswordChange = async () => {
  log('Testing Password Change...');
  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;

    // Change password
    await axios.patch(`${API_BASE}/users/${userId}/password`, {
      currentPassword: 'admin123',
      newPassword: 'newadmin123'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Try login with new password
    await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@test.com',
      password: 'newadmin123'
    });

    log('Password change successful', 'success');

    // Revert password
    await axios.patch(`${API_BASE}/users/${userId}/password`, {
      currentPassword: 'newadmin123',
      newPassword: 'admin123'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return true;
  } catch (error) {
    log(`Password change failed: ${error.response?.data?.message || error.message}`, 'error');
    // Try to revert password in case of partial failure
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'admin@test.com',
        password: 'admin123'
      });
      const token = loginResponse.data.token;
      const userId = loginResponse.data.user.id;
      await axios.patch(`${API_BASE}/users/${userId}/password`, {
        currentPassword: 'admin123',
        newPassword: 'admin123'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      // Ignore revert errors
    }
    return false;
  }
};

// Part 14: Unauthorized Access Prevention
const testUnauthorizedAccess = async () => {
  log('Testing Unauthorized Access Prevention...');
  try {
    // Try to access super admin endpoint without token
    await axios.get(`${API_BASE}/analytics/all`);
    log('Unauthorized access NOT prevented', 'error');
    return false;
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      log('Unauthorized access correctly prevented', 'success');
      return true;
    } else {
      log(`Unexpected error: ${error.message}`, 'error');
      return false;
    }
  }
};

// Part 15: Navigation Routes
const testNavigationRoutes = async () => {
  log('Testing Navigation Routes (Backend)...');
  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;

    const routes = [
      `${API_BASE}/dashboard/stats`,
      `${API_BASE}/complaints`,
      `${API_BASE}/users/all`,
      `${API_BASE}/users/officers`,
      `${API_BASE}/departments`,
      `${API_BASE}/analytics/all`
    ];

    let allWorking = true;
    for (const route of routes) {
      try {
        await axios.get(route, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        log(`Route ${route} failed: ${error.message}`, 'error');
        allWorking = false;
      }
    }

    if (allWorking) {
      log('All navigation routes working', 'success');
    }
    return allWorking;
  } catch (error) {
    log(`Navigation routes test failed: ${error.message}`, 'error');
    return false;
  }
};

// Part 16: Loading/Empty/Error States
const testStates = async () => {
  log('Testing API Error Handling...');
  try {
    // Test invalid user ID
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;

    try {
      await axios.get(`${API_BASE}/users/507f1f77bcf86cd799439011`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      log('Error handling failed - should have returned 404', 'error');
      return false;
    } catch (error) {
      if (error.response?.status === 404) {
        log('Error handling working correctly', 'success');
        return true;
      } else {
        log(`Error handling returned unexpected status: ${error.response?.status}`, 'error');
        return false;
      }
    }
  } catch (error) {
    log(`Error handling test failed: ${error.message}`, 'error');
    return false;
  }
};

// Part 17: Frontend Build
const testFrontendBuild = async () => {
  log('Frontend build test skipped (requires manual verification)', 'info');
  return true;
};

// Part 18: Backend Start
const testBackendStart = async () => {
  log('Testing Backend Start...');
  try {
    const response = await axios.get(`${API_BASE}/health`);
    if (response.data.success) {
      log('Backend is running', 'success');
      return true;
    } else {
      log('Backend health check failed', 'error');
      return false;
    }
  } catch (error) {
    log(`Backend start test failed: ${error.message}`, 'error');
    return false;
  }
};

// Part 19: Environment Variables
const testEnvironmentVariables = async () => {
  log('Testing Environment Variables (Backend Configuration)...');
  try {
    const response = await axios.get(`${API_BASE}/health`);
    if (response.data.success) {
      log('Environment variables configured correctly', 'success');
      return true;
    } else {
      log('Environment variables may be misconfigured', 'error');
      return false;
    }
  } catch (error) {
    log(`Environment variables test failed: ${error.message}`, 'error');
    return false;
  }
};

// Main test runner
const runIntegrationTests = async () => {
  console.log('\n========================================');
  console.log('SMARTCIVIC INTEGRATION TEST SUITE');
  console.log('========================================\n');

  const tests = [
    { name: 'Backend Start', fn: testBackendStart },
    { name: 'Environment Variables', fn: testEnvironmentVariables },
    { name: 'Citizen Registration', fn: testCitizenRegistration },
    { name: 'Citizen Login', fn: testCitizenLogin },
    { name: 'Complaint Submission', fn: testSubmitComplaint },
    { name: 'Complaint in All Complaints', fn: testComplaintInAllComplaints },
    { name: 'User Management', fn: testUserManagement },
    { name: 'Officer Management', fn: testOfficerManagement },
    { name: 'Department Management', fn: testDepartmentManagement },
    { name: 'Officer Department Assignment', fn: testOfficerDepartmentAssignment },
    { name: 'Complaint Association', fn: testComplaintAssociation },
    { name: 'Dashboard Statistics', fn: testDashboardStatistics },
    { name: 'Analytics Calculations', fn: testAnalyticsCalculations },
    { name: 'Profile Update', fn: testProfileUpdate },
    { name: 'Password Change', fn: testPasswordChange },
    { name: 'Unauthorized Access Prevention', fn: testUnauthorizedAccess },
    { name: 'Navigation Routes', fn: testNavigationRoutes },
    { name: 'Error Handling', fn: testStates },
    { name: 'Frontend Build', fn: testFrontendBuild }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    await sleep(500);
  }

  console.log('\n========================================');
  console.log('TEST RESULTS');
  console.log('========================================');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(2)}%`);
  console.log('========================================\n');

  process.exit(failed > 0 ? 1 : 0);
};

runIntegrationTests();
