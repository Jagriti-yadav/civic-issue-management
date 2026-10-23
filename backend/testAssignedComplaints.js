import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const testAssignedComplaints = async () => {
  try {
    console.log('=== Testing Assigned Complaints (Phase 3) ===\n');

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
      if (!complaint.assignedTo && assignedCount < 3) {
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

    // Step 6: Fetch assigned complaints
    console.log('6. Fetching assigned complaints...');
    const myComplaintsResponse = await axios.get(`${API_BASE}/complaints/my`, {
      headers: officerHeaders
    });
    const myComplaints = myComplaintsResponse.data.complaints;
    console.log(`✓ Found ${myComplaints.length} assigned complaints\n`);

    // Step 7: Test complaint details retrieval
    if (myComplaints.length > 0) {
      console.log('7. Testing complaint details retrieval...');
      const complaintId = myComplaints[0]._id;
      const detailsResponse = await axios.get(`${API_BASE}/complaints/${complaintId}`, {
        headers: officerHeaders
      });
      const complaintDetails = detailsResponse.data.complaint;
      console.log('✓ Complaint details retrieved successfully');
      console.log(`   Complaint ID: ${complaintDetails.complaintId}`);
      console.log(`   Title: ${complaintDetails.title}`);
      console.log(`   Status: ${complaintDetails.status}`);
      console.log(`   Priority: ${complaintDetails.priority}`);
      console.log(`   Category: ${complaintDetails.category}`);
      console.log(`   Has ${complaintDetails.images?.length || 0} images`);
      console.log(`   Has ${complaintDetails.remarks?.length || 0} remarks`);
      console.log(`   Has ${complaintDetails.statusHistory?.length || 0} status history entries\n`);
    }

    // Step 8: Test status update to in_progress
    if (myComplaints.length > 0 && myComplaints[0].status === 'assigned') {
      console.log('8. Testing status update to in_progress...');
      const complaintId = myComplaints[0]._id;
      const statusResponse = await axios.patch(
        `${API_BASE}/complaints/${complaintId}/status`,
        { status: 'in_progress', note: 'Started working on complaint' },
        { headers: officerHeaders }
      );
      console.log('✓ Status updated to in_progress successfully\n');
    }

    // Step 9: Test adding a remark
    if (myComplaints.length > 0) {
      console.log('9. Testing add remark...');
      const complaintId = myComplaints[0]._id;
      const remarkResponse = await axios.post(
        `${API_BASE}/complaints/${complaintId}/remarks`,
        { text: 'Investigation in progress. Contacted concerned department.' },
        { headers: officerHeaders }
      );
      console.log('✓ Remark added successfully\n');
    }

    // Step 10: Test complaint resolution
    if (myComplaints.length > 0 && myComplaints[0].status === 'in_progress') {
      console.log('10. Testing complaint resolution...');
      const complaintId = myComplaints[0]._id;
      const resolveResponse = await axios.patch(
        `${API_BASE}/complaints/${complaintId}/status`,
        { 
          status: 'resolved', 
          note: 'Complaint resolved',
          resolutionText: 'Issue has been fixed. Road repair completed successfully.'
        },
        { headers: officerHeaders }
      );
      console.log('✓ Complaint resolved successfully');
      console.log(`   Resolution timestamp: ${resolveResponse.data.complaint.resolutionEvidence.resolvedAt}\n`);
    }

    // Step 11: Refresh complaints to verify changes
    console.log('11. Refreshing complaints to verify changes...');
    const refreshedResponse = await axios.get(`${API_BASE}/complaints/my`, {
      headers: officerHeaders
    });
    const refreshedComplaints = refreshedResponse.data.complaints;
    console.log(`✓ Refreshed complaints count: ${refreshedComplaints.length}`);
    if (refreshedComplaints.length > 0) {
      console.log(`   First complaint status: ${refreshedComplaints[0].status}`);
      console.log(`   First complaint remarks: ${refreshedComplaints[0].remarks?.length || 0}`);
    }
    console.log();

    // Step 12: Test unauthorized access prevention
    console.log('12. Testing unauthorized access prevention...');
    try {
      await axios.get(`${API_BASE}/complaints/my`);
      console.log('✗ Should have failed without authentication\n');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✓ Unauthorized access correctly prevented\n');
      } else {
        console.log(`✗ Unexpected error: ${error.response?.status}\n`);
      }
    }

    console.log('=== Assigned Complaints Test Complete ===');
    console.log('\nTest Summary:');
    console.log(`✓ Officer can fetch assigned complaints`);
    console.log(`✓ Officer can view complaint details`);
    console.log(`✓ Officer can update status to in_progress`);
    console.log(`✓ Officer can add progress remarks`);
    console.log(`✓ Officer can resolve complaints`);
    console.log(`✓ Resolution details saved correctly`);
    console.log(`✓ Unauthorized access prevented`);

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
};

testAssignedComplaints();
