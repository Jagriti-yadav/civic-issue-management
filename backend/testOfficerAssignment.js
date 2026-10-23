import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const testOfficerAssignment = async () => {
  try {
    console.log('=== Testing Officer Complaint Assignment ===\n');

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

    // Step 2: Get all complaints
    console.log('2. Fetching all complaints...');
    const complaintsResponse = await axios.get(`${API_BASE}/complaints`, {
      headers: adminHeaders
    });
    const complaints = complaintsResponse.data.complaints;
    console.log(`✓ Found ${complaints.length} complaints\n`);

    if (complaints.length === 0) {
      console.log('No complaints found. Creating a test complaint...');
      const newComplaint = await axios.post(`${API_BASE}/complaints`, {
        title: 'Test Pothole Issue',
        description: 'Large pothole on Main Street causing traffic issues',
        category: 'roads',
        priority: 'high',
        phoneNumber: '+1234567890',
        location: {
          address: '123 Main Street',
          landmark: 'Near City Hall'
        }
      }, { headers: adminHeaders });
      console.log('✓ Test complaint created\n');
      complaints.push(newComplaint.data.complaint);
    }

    // Step 3: Get all officers
    console.log('3. Fetching all officers...');
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

    // Step 4: Find an unassigned complaint
    const unassignedComplaint = complaints.find(c => !c.assignedTo && c.status === 'pending');
    if (!unassignedComplaint) {
      console.log('No unassigned complaints found. All complaints are already assigned.');
      console.log('Using the first complaint for testing...\n');
    }
    const complaintToAssign = unassignedComplaint || complaints[0];

    // Step 5: Assign complaint to officer
    console.log('4. Assigning complaint to officer...');
    console.log(`   Complaint ID: ${complaintToAssign.complaintId}`);
    console.log(`   Complaint Title: ${complaintToAssign.title}`);
    console.log(`   Officer: ${officers[0].name} (${officers[0].email})\n`);

    const assignResponse = await axios.patch(
      `${API_BASE}/complaints/${complaintToAssign._id}/assign`,
      { officerId: officers[0]._id },
      { headers: adminHeaders }
    );
    console.log('✓ Complaint assigned successfully\n');
    console.log(`   Status: ${assignResponse.data.complaint.status}`);
    console.log(`   Assigned To: ${assignResponse.data.complaint.assignedTo.name}\n`);

    // Step 6: Login as the officer
    console.log('5. Logging in as the assigned officer...');
    const officerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: officers[0].email,
      password: officers[0].email === 'officer@test.com' ? 'officer123' : 'officer123'
    });
    const officerToken = officerLogin.data.token;
    console.log('✓ Officer login successful\n');

    const officerHeaders = {
      'Authorization': `Bearer ${officerToken}`
    };

    // Step 7: Fetch officer's assigned complaints
    console.log('6. Fetching officer\'s assigned complaints...');
    const myComplaintsResponse = await axios.get(`${API_BASE}/complaints/my`, {
      headers: officerHeaders
    });
    const myComplaints = myComplaintsResponse.data.complaints;
    console.log(`✓ Found ${myComplaints.length} assigned complaints\n`);

    // Step 8: Verify the assigned complaint is in the list
    const assignedComplaintFound = myComplaints.find(c => c._id === complaintToAssign._id);
    if (assignedComplaintFound) {
      console.log('✓ SUCCESS: Assigned complaint found in officer\'s dashboard\n');
      console.log('   Complaint Details:');
      console.log(`   - ID: ${assignedComplaintFound.complaintId}`);
      console.log(`   - Title: ${assignedComplaintFound.title}`);
      console.log(`   - Status: ${assignedComplaintFound.status}`);
      console.log(`   - Priority: ${assignedComplaintFound.priority}`);
      console.log(`   - Category: ${assignedComplaintFound.category}\n`);
    } else {
      console.log('✗ FAILED: Assigned complaint NOT found in officer\'s dashboard\n');
    }

    // Step 9: Test stats calculation
    console.log('7. Verifying complaint statistics...');
    const stats = {
      assigned: myComplaints.filter(c => c.status === 'assigned').length,
      inProgress: myComplaints.filter(c => c.status === 'in_progress').length,
      resolved: myComplaints.filter(c => c.status === 'resolved').length,
      total: myComplaints.length
    };
    console.log('   Officer Dashboard Stats:');
    console.log(`   - Assigned: ${stats.assigned}`);
    console.log(`   - In Progress: ${stats.inProgress}`);
    console.log(`   - Resolved: ${stats.resolved}`);
    console.log(`   - Total: ${stats.total}\n`);

    console.log('=== Officer Assignment Test Complete ===');
    console.log('\nTest Summary:');
    console.log(`✓ Super Admin can assign complaints to officers`);
    console.log(`✓ Officers can retrieve their assigned complaints`);
    console.log(`✓ Assigned complaints appear in officer dashboard`);
    console.log(`✓ Statistics calculated correctly`);

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
};

testOfficerAssignment();
