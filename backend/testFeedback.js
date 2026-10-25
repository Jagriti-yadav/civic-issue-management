import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Test credentials
const credentials = {
  citizen: { email: 'citizen@test.com', password: 'citizen123' },
  officer: { email: 'officer@test.com', password: 'officer123' },
  department_head: { email: 'depthead@test.com', password: 'depthead123' },
  admin: { email: 'admin@test.com', password: 'admin123' }
};

let citizenToken = '';
let deptHeadToken = '';
let adminToken = '';
let testComplaintId = '';
let citizenUserId = '';

async function login(role) {
  try {
    const selectedRole = role === 'admin' ? 'super_admin' : role;
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: credentials[role].email,
      password: credentials[role].password,
      selectedRole
    });
    return { token: response.data.token, userId: response.data.user.id || response.data.user._id };
  } catch (error) {
    console.error(`Login failed for ${role}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function testFeedbackWorkflow() {
  console.log('=== Starting Feedback Workflow Tests ===\n');

  // Step 1: Login as citizen
  console.log('1. Logging in as citizen...');
  const citizenAuth = await login('citizen');
  if (!citizenAuth) {
    console.error('Failed to login as citizen. Exiting tests.');
    return;
  }
  citizenToken = citizenAuth.token;
  citizenUserId = citizenAuth.userId;
  console.log('✓ Citizen login successful\n');

  // Step 2: Create a new complaint for testing
  console.log('2. Creating a test complaint...');
  try {
    const response = await axios.post(
      `${API_BASE}/complaints`,
      {
        title: 'Test Complaint for Feedback',
        description: 'This is a test complaint to verify feedback functionality',
        category: 'roads',
        priority: 'medium',
        phoneNumber: '1234567890',
        location: { address: 'Test Location' }
      },
      { headers: { Authorization: `Bearer ${citizenToken}` } }
    );
    console.log('  Response:', JSON.stringify(response.data, null, 2));
    testComplaintId = response.data.complaint._id || response.data.complaint.id;
    console.log(`✓ Test complaint created: ${response.data.complaint.complaintId}`);
    console.log(`  Complaint ID: ${testComplaintId}\n`);
  } catch (error) {
    console.error('Failed to create complaint:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    return;
  }

  // Step 3: Try to submit feedback on non-resolved complaint (should fail)
  console.log('3. Testing feedback submission on non-resolved complaint (should fail)...');
  try {
    await axios.post(
      `${API_BASE}/complaints/${testComplaintId}/feedback`,
      { rating: 5, comment: 'Great service!' },
      { headers: { Authorization: `Bearer ${citizenToken}` } }
    );
    console.log('✗ Should have failed but succeeded\n');
  } catch (error) {
    console.log(`✓ Correctly rejected: ${error.response?.data?.message}\n`);
  }

  // Step 4: Try to resolve complaint as citizen (should fail)
  console.log('4. Testing citizen trying to resolve complaint (should fail)...');
  try {
    await axios.patch(
      `${API_BASE}/complaints/${testComplaintId}/status`,
      { status: 'resolved', remarks: 'Test resolution' },
      { headers: { Authorization: `Bearer ${citizenToken}` } }
    );
    console.log('✗ Citizen should not be able to resolve complaints\n');
  } catch (error) {
    console.log(`✓ Correctly rejected: ${error.response?.data?.message}\n`);
  }

  // Login as admin for assignment fallback
  console.log('4.5. Logging in as admin for potential assignment...');
  const adminAuthForAssign = await login('admin');
  if (adminAuthForAssign) {
    adminToken = adminAuthForAssign.token;
    console.log('✓ Admin login successful\n');
  }

  // Login as officer to resolve
  console.log('5. Logging in as officer to resolve complaint...');
  const officerAuth = await login('officer');
  if (!officerAuth) {
    console.error('Failed to login as officer');
    return;
  }
  const officerToken = officerAuth.token;
  const officerId = officerAuth.userId;
  console.log('✓ Officer login successful');

  // First assign the complaint to the officer
  console.log('6. Assigning complaint to officer...');
  console.log(`  Complaint ID: ${testComplaintId}`);
  console.log(`  Officer ID: ${officerId}`);
  try {
    await axios.patch(
      `${API_BASE}/complaints/${testComplaintId}/assign`,
      { officerId: officerId },
      { headers: { Authorization: `Bearer ${officerToken}` } }
    );
    console.log('✓ Complaint assigned to officer\n');
  } catch (error) {
    console.error('Failed to assign complaint:', error.response?.data?.message || error.message);
    // Try as admin to assign
    console.log('Trying as admin to assign...');
    try {
      await axios.patch(
        `${API_BASE}/complaints/${testComplaintId}/assign`,
        { officerId: officerId },
        { headers: { Authorization: `Bearer ${adminToken || ''}` } }
      );
      console.log('✓ Complaint assigned to officer by admin\n');
    } catch (adminError) {
      console.error('Failed to assign complaint as admin:', adminError.response?.data?.message || adminError.message);
      console.log('⚠ Cannot proceed without assigning complaint\n');
      return;
    }
  }

  // Now resolve the complaint (follow proper workflow: assigned -> in_progress -> resolved)
  console.log('7. Setting complaint to in_progress...');
  try {
    await axios.patch(
      `${API_BASE}/complaints/${testComplaintId}/status`,
      { status: 'in_progress', remarks: 'Starting work on complaint' },
      { headers: { Authorization: `Bearer ${officerToken}` } }
    );
    console.log('✓ Complaint set to in_progress\n');
  } catch (error) {
    console.error('Failed to set in_progress:', error.response?.data?.message || error.message);
    return;
  }

  console.log('8. Resolving complaint...');
  try {
    await axios.patch(
      `${API_BASE}/complaints/${testComplaintId}/status`,
      { status: 'resolved', remarks: 'Issue resolved successfully' },
      { headers: { Authorization: `Bearer ${officerToken}` } }
    );
    console.log('✓ Complaint resolved\n');
  } catch (error) {
    console.error('Failed to resolve complaint:', error.response?.data?.message || error.message);
    console.log('⚠ Cannot proceed with feedback tests without a resolved complaint\n');
    return;
  }

  // Step 5: Submit feedback as citizen (should succeed)
  console.log('9. Submitting feedback as citizen...');
  try {
    const response = await axios.post(
      `${API_BASE}/complaints/${testComplaintId}/feedback`,
      { rating: 5, comment: 'Excellent service, very satisfied!' },
      { headers: { Authorization: `Bearer ${citizenToken}` } }
    );
    console.log('✓ Feedback submitted successfully');
    console.log(`  Rating: ${response.data.feedback.rating}`);
    console.log(`  Comment: ${response.data.feedback.comment}\n`);
  } catch (error) {
    console.error('Failed to submit feedback:', error.response?.data?.message || error.message);
  }

  // Step 6: Try to submit duplicate feedback (should fail)
  console.log('10. Testing duplicate feedback submission (should fail)...');
  try {
    await axios.post(
      `${API_BASE}/complaints/${testComplaintId}/feedback`,
      { rating: 4, comment: 'Second attempt' },
      { headers: { Authorization: `Bearer ${citizenToken}` } }
    );
    console.log('✗ Should have failed but succeeded\n');
  } catch (error) {
    console.log(`✓ Correctly rejected: ${error.response?.data?.message}\n`);
  }

  // Step 7: Login as department head and check feedback
  console.log('11. Logging in as department head...');
  const deptHeadAuth = await login('department_head');
  if (!deptHeadAuth) {
    console.error('Failed to login as department head');
    return;
  }
  deptHeadToken = deptHeadAuth.token;
  console.log('✓ Department head login successful');

  console.log('12. Getting department feedback...');
  try {
    const response = await axios.get(`${API_BASE}/complaints/feedback/department`, {
      headers: { Authorization: `Bearer ${deptHeadToken}` }
    });
    console.log(`✓ Retrieved ${response.data.complaints.length} feedback entries`);
    console.log(`  Total feedback: ${response.data.feedbackStats.totalFeedback}`);
    console.log(`  Average rating: ${response.data.feedbackStats.averageRating.toFixed(1)}\n`);
  } catch (error) {
    console.error('Failed to get department feedback:', error.response?.data?.message || error.message);
  }

  // Step 8: Check analytics (admin already logged in)
  console.log('13. Getting system-wide feedback analytics...');
  try {
    const response = await axios.get(`${API_BASE}/complaints/feedback/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✓ Retrieved feedback analytics');
    console.log(`  Total feedback: ${response.data.overallStats.totalFeedback}`);
    console.log(`  Average rating: ${response.data.overallStats.averageRating.toFixed(1)}`);
    console.log(`  Departments with feedback: ${response.data.departmentStats.length}`);
    console.log(`  Officers with feedback: ${response.data.officerStats.length}\n`);
  } catch (error) {
    console.error('Failed to get feedback analytics:', error.response?.data?.message || error.message);
  }

  console.log('=== Feedback Workflow Tests Complete ===');
}

// Run tests
testFeedbackWorkflow().catch(console.error);
