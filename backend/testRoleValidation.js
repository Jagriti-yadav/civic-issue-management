import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

async function testLogin(email, password, selectedRole, expectedStatus, expectedMessage = null) {
  console.log(`\nTesting: ${email} with role: ${selectedRole || 'none'}`);
  
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
      selectedRole
    });

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, response.data);

    if (response.status !== expectedStatus) {
      console.error(`❌ FAILED: Expected status ${expectedStatus}, got ${response.status}`);
      return false;
    }

    if (expectedMessage && !response.data.message.includes(expectedMessage)) {
      console.error(`❌ FAILED: Expected message to include "${expectedMessage}", got "${response.data.message}"`);
      return false;
    }

    console.log(`✅ PASSED`);
    return true;
  } catch (error) {
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response:`, error.response.data);

      if (error.response.status !== expectedStatus) {
        console.error(`❌ FAILED: Expected status ${expectedStatus}, got ${error.response.status}`);
        return false;
      }

      if (expectedMessage && !error.response.data.message.includes(expectedMessage)) {
        console.error(`❌ FAILED: Expected message to include "${expectedMessage}", got "${error.response.data.message}"`);
        return false;
      }

      console.log(`✅ PASSED`);
      return true;
    } else {
      console.error(`❌ ERROR:`, error.message);
      return false;
    }
  }
}

async function runTests() {
  console.log('=== Role Validation Tests ===');
  console.log('Make sure the backend server is running on http://localhost:5000');
  
  const results = [];

  // Test 1: Citizen with correct role selection
  results.push(await testLogin('citizen@test.com', 'citizen123', 'citizen', 200));

  // Test 2: Citizen trying to login as Officer (should fail)
  results.push(await testLogin('citizen@test.com', 'citizen123', 'officer', 403, 'registered as a Citizen'));

  // Test 3: Citizen trying to login as Department Head (should fail)
  results.push(await testLogin('citizen@test.com', 'citizen123', 'department_head', 403, 'registered as a Citizen'));

  // Test 4: Citizen trying to login as Super Admin (should fail)
  results.push(await testLogin('citizen@test.com', 'citizen123', 'super_admin', 403, 'registered as a Citizen'));

  // Test 5: Officer with correct role selection
  results.push(await testLogin('officer@test.com', 'officer123', 'officer', 200));

  // Test 6: Officer trying to login as Citizen (should fail)
  results.push(await testLogin('officer@test.com', 'officer123', 'citizen', 403, 'Officer'));

  // Test 7: Officer trying to login as Department Head (should fail)
  results.push(await testLogin('officer@test.com', 'officer123', 'department_head', 403, 'Officer'));

  // Test 8: Department Head with correct role selection
  results.push(await testLogin('depthead@test.com', 'depthead123', 'department_head', 200));

  // Test 9: Department Head trying to login as Admin (should fail)
  results.push(await testLogin('depthead@test.com', 'depthead123', 'super_admin', 403, 'registered as a Department Head'));

  // Test 10: Super Admin with correct role selection
  results.push(await testLogin('admin@test.com', 'admin123', 'super_admin', 200));

  // Test 11: Invalid password
  results.push(await testLogin('citizen@test.com', 'wrongpassword', 'citizen', 401, 'Invalid credentials'));

  // Test 12: User not found
  results.push(await testLogin('nonexistent@test.com', 'password123', 'citizen', 401, 'Invalid credentials'));

  // Test 13: Login without role selection (should work for any role)
  results.push(await testLogin('citizen@test.com', 'citizen123', '', 200));

  console.log('\n=== Test Results ===');
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('✅ All tests passed!');
  } else {
    console.log('❌ Some tests failed');
  }
}

runTests();
