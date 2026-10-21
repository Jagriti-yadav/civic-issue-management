# Civic Issue Management - Test Cases

## Prerequisites
- Backend server running on `http://localhost:5000`
- MongoDB database connected
- At least one user registered for each role (citizen, officer, department_head, super_admin)
- Valid JWT tokens for authentication

## Setup Test Data

### 1. Register Test Users
```bash
# Register Citizen
POST http://localhost:5000/api/auth/register
{
  "name": "Test Citizen",
  "email": "citizen@test.com",
  "password": "test123",
  "role": "citizen"
}

# Register Officer
POST http://localhost:5000/api/auth/register
{
  "name": "Test Officer",
  "email": "officer@test.com",
  "password": "test123",
  "role": "officer",
  "department": "Electricity Department"
}

# Register Department Head
POST http://localhost:5000/api/auth/register
{
  "name": "Test Dept Head",
  "email": "dept@test.com",
  "password": "test123",
  "role": "department_head",
  "department": "Electricity Department"
}

# Register Super Admin
POST http://localhost:5000/api/auth/register
{
  "name": "Test Admin",
  "email": "admin@test.com",
  "password": "test123",
  "role": "super_admin"
}
```

Save the tokens from each response for subsequent tests.

---

## Complaint Management Test Cases

### TC-COM-001: Create Complaint (Citizen)
**Preconditions:** Citizen logged in with valid token

**Steps:**
1. Send POST request to `/api/complaints` with valid complaint data
2. Verify response status is 201
3. Verify complaint is created with status "pending"
4. Verify complaintId is generated (e.g., CMP-2026-001)
5. Verify department is auto-assigned based on category

**Expected Result:** Complaint created successfully with pending status

**Test Data:**
```json
{
  "title": "Broken street light",
  "description": "Street light at main intersection is not working",
  "category": "electricity",
  "priority": "high",
  "location": {
    "address": "123 Main Street",
    "landmark": "Near City Mall"
  },
  "phoneNumber": "+1234567890"
}
```

---

### TC-COM-002: Create Complaint - Missing Required Fields
**Preconditions:** Citizen logged in

**Steps:**
1. Send POST request to `/api/complaints` without title
2. Verify response status is 400
3. Verify error message indicates missing field

**Expected Result:** Returns 400 with validation error

---

### TC-COM-003: Create Complaint - Invalid Category
**Preconditions:** Citizen logged in

**Steps:**
1. Send POST request with invalid category "invalid_category"
2. Verify response status is 400 or 500

**Expected Result:** Returns error for invalid category

---

### TC-COM-004: Get All Complaints (Admin)
**Preconditions:** Super Admin logged in

**Steps:**
1. Send GET request to `/api/complaints`
2. Verify response status is 200
3. Verify complaints array is returned
4. Verify each complaint has all required fields

**Expected Result:** Returns all complaints with full details

---

### TC-COM-005: Get All Complaints - Unauthorized
**Preconditions:** Citizen logged in

**Steps:**
1. Send GET request to `/api/complaints` with citizen token
2. Verify response status is 403

**Expected Result:** Returns 403 Forbidden (insufficient permissions)

---

### TC-COM-006: Filter Complaints by Status
**Preconditions:** Admin logged in

**Steps:**
1. Send GET request to `/api/complaints?status=pending`
2. Verify response status is 200
3. Verify all returned complaints have status "pending"

**Expected Result:** Returns only pending complaints

---

### TC-COM-007: Filter Complaints by Priority
**Preconditions:** Admin logged in

**Steps:**
1. Send GET request to `/api/complaints?priority=critical`
2. Verify response status is 200
3. Verify all returned complaints have priority "critical"

**Expected Result:** Returns only critical priority complaints

---

### TC-COM-008: Filter Complaints by Department
**Preconditions:** Admin logged in

**Steps:**
1. Send GET request to `/api/complaints?department=Electricity Department`
2. Verify response status is 200
3. Verify all returned complaints are from Electricity Department

**Expected Result:** Returns only electricity department complaints

---

### TC-COM-009: Get Complaint by ID
**Preconditions:** Any authenticated user

**Steps:**
1. Send GET request to `/api/complaints/:id` with valid complaint ID
2. Verify response status is 200
3. Verify complaint details are returned
4. Verify statusHistory array is populated

**Expected Result:** Returns full complaint details with history

---

### TC-COM-010: Get Complaint by ID - Not Found
**Preconditions:** Any authenticated user

**Steps:**
1. Send GET request to `/api/complaints/invalid_id`
2. Verify response status is 404

**Expected Result:** Returns 404 Not Found

---

### TC-COM-011: Track Complaint (Public)
**Preconditions:** No authentication required

**Steps:**
1. Send GET request to `/api/complaints/track/CMP-2026-001`
2. Verify response status is 200
3. Verify complaint details are returned

**Expected Result:** Returns complaint details without authentication

---

### TC-COM-012: Update Status - Valid Transition (Pending → Assigned)
**Preconditions:** Department Head logged in, complaint in "pending" status

**Steps:**
1. Send PATCH request to `/api/complaints/:id/status` with status "assigned"
2. Verify response status is 200
3. Verify complaint status is now "assigned"
4. Verify statusHistory has new entry
5. Verify notification is created for submitter

**Expected Result:** Status updated successfully, history logged

**Test Data:**
```json
{
  "status": "assigned",
  "note": "Assigned to Officer Smith"
}
```

---

### TC-COM-013: Update Status - Valid Transition (Assigned → In Progress)
**Preconditions:** Officer logged in, complaint in "assigned" status

**Steps:**
1. Send PATCH request with status "in_progress"
2. Verify response status is 200
3. Verify status changed to "in_progress"

**Expected Result:** Status updated successfully

---

### TC-COM-014: Update Status - Valid Transition (In Progress → Resolved)
**Preconditions:** Officer logged in, complaint in "in_progress" status

**Steps:**
1. Send PATCH request with status "resolved"
2. Verify response status is 200
3. Verify status changed to "resolved"
4. Verify resolutionEvidence.resolvedAt is set

**Expected Result:** Complaint marked as resolved

---

### TC-COM-015: Update Status - Invalid Transition (Resolved → In Progress)
**Preconditions:** Admin logged in, complaint in "resolved" status

**Steps:**
1. Send PATCH request with status "in_progress"
2. Verify response status is 400
3. Verify error message about invalid transition

**Expected Result:** Returns 400 with transition validation error

---

### TC-COM-016: Update Status - Invalid Transition (Pending → Resolved)
**Preconditions:** Admin logged in, complaint in "pending" status

**Steps:**
1. Send PATCH request with status "resolved"
2. Verify response status is 400

**Expected Result:** Returns 400 (must go through assigned → in_progress)

---

### TC-COM-017: Update Status - Same Status
**Preconditions:** Admin logged in, complaint in "pending" status

**Steps:**
1. Send PATCH request with status "pending"
2. Verify response status is 400
3. Verify error message about same status

**Expected Result:** Returns 400 (status already pending)

---

### TC-COM-018: Update Status - Unauthorized (Citizen)
**Preconditions:** Citizen logged in

**Steps:**
1. Send PATCH request to `/api/complaints/:id/status`
2. Verify response status is 403

**Expected Result:** Returns 403 Forbidden

---

### TC-COM-019: Update Priority (Department Head)
**Preconditions:** Department Head logged in

**Steps:**
1. Send PATCH request to `/api/complaints/:id/priority` with priority "critical"
2. Verify response status is 200
3. Verify priority changed to "critical"
4. Verify statusHistory has entry about priority change

**Expected Result:** Priority updated successfully

**Test Data:**
```json
{
  "priority": "critical",
  "note": "Urgent - affecting public safety"
}
```

---

### TC-COM-020: Update Priority - Unauthorized (Officer)
**Preconditions:** Officer logged in

**Steps:**
1. Send PATCH request to `/api/complaints/:id/priority`
2. Verify response status is 403

**Expected Result:** Returns 403 Forbidden (only dept head and admin)

---

### TC-COM-021: Assign Complaint to Officer
**Preconditions:** Department Head logged in, unassigned complaint exists

**Steps:**
1. Send PATCH request to `/api/complaints/:id/assign` with officerId
2. Verify response status is 200
3. Verify complaint status changed to "assigned"
4. Verify assignedTo field populated
5. Verify statusHistory has assignment entry
6. Verify notification created for officer

**Expected Result:** Complaint assigned successfully

**Test Data:**
```json
{
  "officerId": "67a..."
}
```

---

### TC-COM-022: Assign Complaint - Invalid Officer ID
**Preconditions:** Department Head logged in

**Steps:**
1. Send PATCH request with invalid officerId
2. Verify response status is 404

**Expected Result:** Returns 404 (officer not found)

---

### TC-COM-023: Assign Complaint - Officer Not Active
**Preconditions:** Department Head logged in, officer exists but isActive: false

**Steps:**
1. Send PATCH request with inactive officerId
2. Verify response status is 400
3. Verify error message about inactive officer

**Expected Result:** Returns 400 (officer not active)

---

### TC-COM-024: Assign Complaint - Department Mismatch
**Preconditions:** Department Head logged in, officer from different department

**Steps:**
1. Send PATCH request with officer from Water Department to Electricity complaint
2. Verify response status is 400
3. Verify error message about department mismatch

**Expected Result:** Returns 400 (department mismatch)

---

### TC-COM-025: Assign Complaint - Already Assigned
**Preconditions:** Department Head logged in, complaint already assigned

**Steps:**
1. Send PATCH request to reassign complaint
2. Verify response status is 400
3. Verify error message about already assigned

**Expected Result:** Returns 400 (already assigned)

---

### TC-COM-026: Add Remark to Complaint
**Preconditions:** Any authenticated user

**Steps:**
1. Send POST request to `/api/complaints/:id/remarks` with remark text
2. Verify response status is 200
3. Verify remark added to remarks array
4. Verify timestamp is set

**Expected Result:** Remark added successfully

**Test Data:**
```json
{
  "text": "Site visit completed. Repair scheduled."
}
```

---

### TC-COM-027: Get User Complaints
**Preconditions:** Citizen logged in

**Steps:**
1. Send GET request to `/api/complaints/user/:userId`
2. Verify response status is 200
3. Verify only complaints submitted by that user are returned

**Expected Result:** Returns user's complaints only

---

### TC-COM-028: Get Complaint Statistics
**Preconditions:** Admin logged in

**Steps:**
1. Send GET request to `/api/complaints/stats`
2. Verify response status is 200
3. Verify stats object with correct counts
4. Verify categoryStats array
5. Verify departmentStats array

**Expected Result:** Returns comprehensive statistics

---

## User Management Test Cases

### TC-USER-001: Get All Departments
**Preconditions:** Department Head logged in

**Steps:**
1. Send GET request to `/api/users/departments/list`
2. Verify response status is 200
3. Verify departments array returned

**Expected Result:** Returns list of all departments

---

### TC-USER-002: Get Officers by Department
**Preconditions:** Department Head logged in

**Steps:**
1. Send GET request to `/api/users/officers/department/Electricity Department`
2. Verify response status is 200
3. Verify only active officers from that department returned

**Expected Result:** Returns officers for specified department

---

### TC-USER-003: Get User by ID
**Preconditions:** Any authenticated user

**Steps:**
1. Send GET request to `/api/users/:id`
2. Verify response status is 200
3. Verify user details returned (without password)

**Expected Result:** Returns user details

---

### TC-USER-004: Update User Profile
**Preconditions:** User logged in

**Steps:**
1. Send PATCH request to `/api/users/:id` with new name
2. Verify response status is 200
3. Verify name updated

**Expected Result:** Profile updated successfully

---

### TC-USER-005: Update User - Email Already Exists
**Preconditions:** User logged in

**Steps:**
1. Send PATCH request with email that belongs to another user
2. Verify response status is 400
3. Verify error message about email in use

**Expected Result:** Returns 400 (email already in use)

---

### TC-USER-006: Change Password
**Preconditions:** User logged in

**Steps:**
1. Send PATCH request to `/api/users/:id/password` with correct current password
2. Verify response status is 200

**Expected Result:** Password changed successfully

---

### TC-USER-007: Change Password - Wrong Current Password
**Preconditions:** User logged in

**Steps:**
1. Send PATCH request with incorrect current password
2. Verify response status is 401
3. Verify error message about incorrect password

**Expected Result:** Returns 401 (current password incorrect)

---

### TC-USER-008: Change Password - New Password Too Short
**Preconditions:** User logged in

**Steps:**
1. Send PATCH request with new password less than 6 characters
2. Verify response status is 400
3. Verify error message about password length

**Expected Result:** Returns 400 (password too short)

---

## Authorization Test Cases

### TC-AUTH-001: Access Admin Endpoint as Citizen
**Preconditions:** Citizen logged in

**Steps:**
1. Send GET request to `/api/complaints` (admin-only endpoint)
2. Verify response status is 403

**Expected Result:** Returns 403 Forbidden

---

### TC-AUTH-002: Access Admin Endpoint without Token
**Preconditions:** No authentication

**Steps:**
1. Send GET request to `/api/complaints` without Authorization header
2. Verify response status is 401

**Expected Result:** Returns 401 Unauthorized

---

### TC-AUTH-003: Access Admin Endpoint with Invalid Token
**Preconditions:** Invalid/expired token

**Steps:**
1. Send GET request with invalid Bearer token
2. Verify response status is 401

**Expected Result:** Returns 401 Unauthorized

---

### TC-AUTH-004: Officer Can Update Status
**Preconditions:** Officer logged in

**Steps:**
1. Send PATCH request to `/api/complaints/:id/status`
2. Verify response status is 200

**Expected Result:** Officer can update status

---

### TC-AUTH-005: Officer Cannot Update Priority
**Preconditions:** Officer logged in

**Steps:**
1. Send PATCH request to `/api/complaints/:id/priority`
2. Verify response status is 403

**Expected Result:** Returns 403 (only dept head and admin)

---

### TC-AUTH-006: Department Head Can Assign Complaints
**Preconditions:** Department Head logged in

**Steps:**
1. Send PATCH request to `/api/complaints/:id/assign`
2. Verify response status is 200

**Expected Result:** Department head can assign complaints

---

## Integration Test Cases

### TC-INT-001: Complete Complaint Workflow
**Preconditions:** Users for all roles registered

**Steps:**
1. Citizen submits complaint → Status: pending
2. Department head assigns to officer → Status: assigned
3. Officer views in dashboard → Complaint appears
4. Officer updates to in_progress → Status: in_progress
5. Officer adds remark → Remark logged
6. Officer updates to resolved → Status: resolved
7. Citizen tracks complaint → Shows resolved status

**Expected Result:** Complete workflow functions correctly

---

### TC-INT-002: Assigned Complaints in Officer Dashboard
**Preconditions:** Officer with assigned complaints

**Steps:**
1. Login as officer
2. Navigate to officer dashboard
3. Verify only assigned complaints appear
4. Verify stats are correct

**Expected Result:** Officer sees only their assigned complaints

---

### TC-INT-003: Status History Tracking
**Preconditions:** Complaint with multiple status changes

**Steps:**
1. Get complaint details
2. Verify statusHistory array has all changes
3. Verify each entry has status, changedBy, timestamp, note
4. Verify chronological order

**Expected Result:** Complete status history maintained

---

### TC-INT-004: Notification on Status Change
**Preconditions:** Complaint submitted

**Steps:**
1. Update complaint status
2. Check notifications for submitter
3. Verify notification created with correct type

**Expected Result:** Notification created for submitter

---

### TC-INT-005: Department Mapping
**Preconditions:** Multiple complaint categories

**Steps:**
1. Create complaint with category "roads"
2. Verify department is "Public Works"
3. Create complaint with category "water"
4. Verify department is "Water Department"

**Expected Result:** Department auto-assigned correctly

---

## Edge Cases

### TC-EDGE-001: Very Long Description
**Preconditions:** Citizen logged in

**Steps:**
1. Create complaint with 10,000 character description
2. Verify complaint created successfully

**Expected Result:** Handles long descriptions

---

### TC-EDGE-002: Special Characters in Title
**Preconditions:** Citizen logged in

**Steps:**
1. Create complaint with special characters: "Test @#$%^&*()"
2. Verify complaint created successfully

**Expected Result:** Handles special characters

---

### TC-EDGE-003: Unicode Characters
**Preconditions:** Citizen logged in

**Steps:**
1. Create complaint with unicode: "Test 你好 🚨"
2. Verify complaint created successfully

**Expected Result:** Handles unicode characters

---

### TC-EDGE-004: Multiple Images
**Preconditions:** Citizen logged in

**Steps:**
1. Create complaint with 10 image URLs
2. Verify all images saved

**Expected Result:** Handles multiple images

---

### TC-EDGE-005: No Location Data
**Preconditions:** Citizen logged in

**Steps:**
1. Create complaint without location field
2. Verify complaint created with empty location

**Expected Result:** Handles missing location

---

## Performance Test Cases

### TC-PERF-001: Large Number of Complaints
**Preconditions:** 1000+ complaints in database

**Steps:**
1. Send GET request to `/api/complaints`
2. Measure response time
3. Verify response time < 2 seconds

**Expected Result:** Handles large datasets efficiently

---

### TC-PERF-002: Concurrent Requests
**Preconditions:** Multiple users

**Steps:**
1. Send 10 concurrent requests to `/api/complaints`
2. Verify all requests succeed
3. Verify no data corruption

**Expected Result:** Handles concurrent requests

---

## Security Test Cases

### TC-SEC-001: SQL Injection Attempt
**Preconditions:** Citizen logged in

**Steps:**
1. Create complaint with title containing SQL injection: "'; DROP TABLE complaints; --"
2. Verify complaint created safely
3. Verify database integrity

**Expected Result:** SQL injection prevented

---

### TC-SEC-002: XSS Attempt
**Preconditions:** Citizen logged in

**Steps:**
1. Create complaint with XSS: "<script>alert('xss')</script>"
2. Verify script not executed when viewing

**Expected Result:** XSS prevented

---

### TC-SEC-003: Token Theft Protection
**Preconditions:** Valid token

**Steps:**
1. Use token from different IP/session
2. Verify still works (no IP/session binding currently)

**Expected Result:** Current implementation allows token reuse (future enhancement: add IP binding)

---

## Postman Collection Structure

```
Civic Issue Management
├── Authentication
│   ├── Register
│   ├── Login
│   └── Logout (if implemented)
├── Complaints
│   ├── Create Complaint
│   ├── Get All Complaints
│   ├── Get Complaint by ID
│   ├── Track Complaint (Public)
│   ├── Update Status
│   ├── Update Priority
│   ├── Assign Complaint
│   ├── Add Remark
│   ├── Get User Complaints
│   └── Get Statistics
├── Users
│   ├── Get Departments
│   ├── Get Officers by Department
│   ├── Get User by ID
│   ├── Update Profile
│   └── Change Password
└── Tests
    ├── Workflow Tests
    ├── Authorization Tests
    └── Edge Cases
```

## Test Results Template

| Test Case ID | Description | Status | Notes |
|--------------|-------------|--------|-------|
| TC-COM-001 | Create Complaint | ✅ Pass | - |
| TC-COM-002 | Missing Required Fields | ✅ Pass | - |
| ... | ... | ... | ... |

## Known Issues
- List any issues found during testing
- Document workarounds if any

## Recommendations
- Suggestions for improvements
- Security enhancements
- Performance optimizations
