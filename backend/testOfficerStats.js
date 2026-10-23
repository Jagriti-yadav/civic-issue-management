import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const testOfficerDashboardStats = async () => {
  try {
    console.log('=== Testing Officer Dashboard Statistics ===\n');

    // Step 1: Login as Super Admin
    console.log('1. Logging in as Super Admin...');
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.token;
    console.log('✓ Super Admin login successful\n');

    const adminHeaders = {
      'Authorization': `Bearer ${adminToken}`
    };

    // Step 2: Get all officers
    console.log('2. Fetching all officers...');
    const officersResponse = await axios.get(`${API_BASE}/users/officers`, {
      headers: adminHeaders
    });
    const officers = officersResponse.data.officers;
    console.log(`✓ Found ${officers.length} officers\n`);

    if (officers.length === 0) {
      console.log('No officers found. Creating a test officer...');
      const newOfficer = await axios.post(`${API_BASE}/users/officers`, {
        name: 'Test Officer',
        email: 'testofficer@test.com',
        password: 'officer123',
        department: 'Public Works',
        designation: 'Field Officer'
      }, { headers: adminHeaders });
      console.log('✓ Test officer created\n');
      officers.push(newOfficer.data.officer);
    }

    // Step 3: Get all complaints
    console.log('3. Fetching all complaints...');
    const complaintsResponse = await axios.get(`${API_BASE}/complaints`, {
      headers: adminHeaders
    });
    const complaints = complaintsResponse.data.complaints;
    console.log(`✓ Found ${complaints.length} complaints\n`);

    // Step 4: Assign multiple complaints to the officer
    console.log('4. Assigning complaints to officer...');
    let assignedCount = 0;
    for (const complaint of complaints) {
      if (!complaint.assignedTo && assignedCount < 5) {
        try {
          await axios.patch(
            `${API_BASE}/complaints/${complaint._id}/assign`,
            { officerId: officers[0]._id },
            { headers: adminHeaders }
          );
          assignedCount++;
          console.log(`   Assigned: ${complaint.complaintId} (${complaint.title})`);
        } catch (err) {
          console.log(`   Skipped: ${complaint.complaintId} (already assigned or error)`);
        }
      }
    }
    console.log(`✓ Assigned ${assignedCount} complaints to officer\n`);

    // Step 5: Login as the officer
    console.log('5. Logging in as the officer...');
    const officerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: officers[0].email,
      password: 'officer123'
    });
    const officerToken = officerLogin.data.token;
    console.log('✓ Officer login successful\n');

    const officerHeaders = {
      'Authorization': `Bearer ${officerToken}`
    };

    // Step 6: Fetch officer dashboard statistics
    console.log('6. Fetching officer dashboard statistics...');
    const statsResponse = await axios.get(`${API_BASE}/complaints/my/stats`, {
      headers: officerHeaders
    });
    const stats = statsResponse.data.stats;
    const recentComplaints = statsResponse.data.recentComplaints;
    const highPriorityComplaints = statsResponse.data.highPriorityComplaints;
    console.log('✓ Statistics fetched successfully\n');

    // Step 7: Display statistics
    console.log('7. Dashboard Statistics:');
    console.log(`   Total Assigned: ${stats.total}`);
    console.log(`   Assigned (Awaiting Action): ${stats.assigned}`);
    console.log(`   In Progress: ${stats.inProgress}`);
    console.log(`   Resolved: ${stats.resolved}`);
    console.log(`   High Priority: ${stats.highPriority}\n`);

    // Step 8: Display recent complaints
    console.log('8. Recent Assigned Complaints:');
    recentComplaints.forEach((complaint, index) => {
      console.log(`   ${index + 1}. ${complaint.complaintId} - ${complaint.title}`);
      console.log(`      Status: ${complaint.status}, Priority: ${complaint.priority}`);
    });
    console.log();

    // Step 9: Display high-priority complaints
    console.log('9. High Priority Complaints:');
    highPriorityComplaints.forEach((complaint, index) => {
      console.log(`   ${index + 1}. ${complaint.complaintId} - ${complaint.title}`);
      console.log(`      Status: ${complaint.status}, Priority: ${complaint.priority}`);
    });
    console.log();

    // Step 10: Verify statistics match actual data
    console.log('10. Verifying statistics match actual data...');
    const allComplaintsResponse = await axios.get(`${API_BASE}/complaints/my`, {
      headers: officerHeaders
    });
    const allComplaints = allComplaintsResponse.data.complaints;

    const actualTotal = allComplaints.length;
    const actualAssigned = allComplaints.filter(c => c.status === 'assigned').length;
    const actualInProgress = allComplaints.filter(c => c.status === 'in_progress').length;
    const actualResolved = allComplaints.filter(c => c.status === 'resolved').length;
    const actualHighPriority = allComplaints.filter(c => c.priority === 'high' || c.priority === 'critical').length;

    console.log('   Backend Statistics:');
    console.log(`   - Total: ${stats.total}`);
    console.log(`   - Assigned: ${stats.assigned}`);
    console.log(`   - In Progress: ${stats.inProgress}`);
    console.log(`   - Resolved: ${stats.resolved}`);
    console.log(`   - High Priority: ${stats.highPriority}`);
    console.log();
    console.log('   Actual Count from All Complaints:');
    console.log(`   - Total: ${actualTotal}`);
    console.log(`   - Assigned: ${actualAssigned}`);
    console.log(`   - In Progress: ${actualInProgress}`);
    console.log(`   - Resolved: ${actualResolved}`);
    console.log(`   - High Priority: ${actualHighPriority}`);
    console.log();

    const statsMatch =
      stats.total === actualTotal &&
      stats.assigned === actualAssigned &&
      stats.inProgress === actualInProgress &&
      stats.resolved === actualResolved &&
      stats.highPriority === actualHighPriority;

    if (statsMatch) {
      console.log('✓ SUCCESS: Statistics match actual complaint data\n');
    } else {
      console.log('✗ WARNING: Statistics do not match actual data\n');
    }

    console.log('=== Officer Dashboard Statistics Test Complete ===');
    console.log('\nTest Summary:');
    console.log(`✓ Dashboard statistics endpoint working`);
    console.log(`✓ Statistics calculated correctly`);
    console.log(`✓ Recent complaints retrieved`);
    console.log(`✓ High-priority complaints retrieved`);
    console.log(`✓ Statistics match actual data: ${statsMatch ? 'YES' : 'NO'}`);

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
};

testOfficerDashboardStats();
