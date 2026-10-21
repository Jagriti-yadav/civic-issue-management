# Civic Issue Management - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Complaint Management APIs

### 1. Create Complaint
**Endpoint:** `POST /api/complaints`  
**Auth:** Citizen, Officer, Department Head, Super Admin  
**Description:** Submit a new civic complaint

**Request Body:**
```json
{
  "title": "Broken street light",
  "description": "Street light at main intersection is not working",
  "category": "electricity",
  "priority": "high",
  "location": {
    "address": "123 Main Street",
    "landmark": "Near City Mall",
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "phoneNumber": "+1234567890",
  "images": ["image1.jpg", "image2.jpg"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Complaint created successfully",
  "complaint": {
    "id": "67a...",
    "complaintId": "CMP-2026-001",
    "title": "Broken street light",
    "description": "Street light at main intersection is not working",
    "category": "electricity",
    "priority": "high",
    "status": "pending",
    "location": { ... },
    "phoneNumber": "+1234567890",
    "images": ["image1.jpg", "image2.jpg"],
    "department": "Electricity Department",
    "createdAt": "2026-10-15T10:00:00.000Z"
  }
}
```

**Valid Categories:** `roads`, `water`, `electricity`, `sanitation`, `public_safety`, `other`  
**Valid Priorities:** `low`, `medium`, `high`, `critical`

---

### 2. Get All Complaints
**Endpoint:** `GET /api/complaints`  
**Auth:** Officer, Department Head, Super Admin  
**Description:** Retrieve all complaints with optional filters

**Query Parameters:**
- `status` (optional): Filter by status (pending, assigned, in_progress, resolved, rejected)
- `category` (optional): Filter by category
- `priority` (optional): Filter by priority
- `department` (optional): Filter by department

**Example:** `GET /api/complaints?status=pending&priority=high`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "complaints": [
    {
      "_id": "67a...",
      "complaintId": "CMP-2026-001",
      "title": "Broken street light",
      "description": "...",
      "category": "electricity",
      "priority": "high",
      "status": "pending",
      "department": "Electricity Department",
      "submittedBy": {
        "_id": "67a...",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "assignedTo": null,
      "createdAt": "2026-10-15T10:00:00.000Z"
    }
  ]
}
```

---

### 3. Get Complaint by ID
**Endpoint:** `GET /api/complaints/:id`  
**Auth:** All authenticated users  
**Description:** Retrieve detailed complaint information by MongoDB ID

**Response:**
```json
{
  "success": true,
  "complaint": {
    "_id": "67a...",
    "complaintId": "CMP-2026-001",
    "title": "Broken street light",
    "description": "...",
    "category": "electricity",
    "priority": "high",
    "status": "in_progress",
    "location": { ... },
    "phoneNumber": "+1234567890",
    "images": [],
    "department": "Electricity Department",
    "submittedBy": { ... },
    "assignedTo": {
      "_id": "67a...",
      "name": "Officer Smith",
      "email": "smith@dept.gov"
    },
    "remarks": [
      {
        "user": { ... },
        "text": "Investigation in progress",
        "timestamp": "2026-10-15T11:00:00.000Z"
      }
    ],
    "statusHistory": [
      {
        "status": "pending",
        "changedBy": { ... },
        "timestamp": "2026-10-15T10:00:00.000Z",
        "note": "Complaint submitted"
      },
      {
        "status": "assigned",
        "changedBy": { ... },
        "timestamp": "2026-10-15T10:30:00.000Z",
        "note": "Assigned to officer Smith"
      },
      {
        "status": "in_progress",
        "changedBy": { ... },
        "timestamp": "2026-10-15T11:00:00.000Z",
        "note": "Started investigation"
      }
    ],
    "createdAt": "2026-10-15T10:00:00.000Z",
    "updatedAt": "2026-10-15T11:00:00.000Z"
  }
}
```

---

### 4. Get Complaint by Complaint ID (Public Tracking)
**Endpoint:** `GET /api/complaints/track/:complaintId`  
**Auth:** Public (no authentication required)  
**Description:** Track complaint status using the complaint ID (e.g., CMP-2026-001)

**Response:** Same as Get Complaint by ID

---

### 5. Update Complaint Status
**Endpoint:** `PATCH /api/complaints/:id/status`  
**Auth:** Officer, Department Head, Super Admin  
**Description:** Update complaint status with transition validation

**Valid Status Transitions:**
- `pending` → `assigned`, `rejected`
- `assigned` → `in_progress`, `rejected`
- `in_progress` → `resolved`, `rejected`
- `resolved` → (no transitions allowed)
- `rejected` → (no transitions allowed)

**Request Body:**
```json
{
  "status": "in_progress",
  "note": "Started investigation on site"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Complaint status updated successfully",
  "complaint": {
    "id": "67a...",
    "complaintId": "CMP-2026-001",
    "status": "in_progress",
    "previousStatus": "assigned",
    "updatedAt": "2026-10-15T11:00:00.000Z"
  }
}
```

**Error Response (Invalid Transition):**
```json
{
  "success": false,
  "message": "Cannot transition from resolved to in_progress. Allowed transitions: "
}
```

---

### 6. Update Complaint Priority
**Endpoint:** `PATCH /api/complaints/:id/priority`  
**Auth:** Department Head, Super Admin  
**Description:** Update complaint priority (can be changed at any time)

**Request Body:**
```json
{
  "priority": "critical",
  "note": "Urgent - affecting public safety"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Complaint priority updated successfully",
  "complaint": {
    "id": "67a...",
    "complaintId": "CMP-2026-001",
    "priority": "critical",
    "previousPriority": "high",
    "updatedAt": "2026-10-15T11:00:00.000Z"
  }
}
```

---

### 7. Assign Complaint to Officer
**Endpoint:** `PATCH /api/complaints/:id/assign`  
**Auth:** Department Head, Super Admin  
**Description:** Assign a complaint to an officer

**Request Body:**
```json
{
  "officerId": "67a..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Complaint assigned successfully",
  "complaint": {
    "id": "67a...",
    "complaintId": "CMP-2026-001",
    "title": "Broken street light",
    "status": "assigned",
    "assignedTo": {
      "id": "67a...",
      "name": "Officer Smith",
      "email": "smith@dept.gov",
      "department": "Electricity Department"
    }
  }
}
```

**Validations:**
- Officer must exist and have role 'officer'
- Officer must be active (isActive: true)
- Officer's department must match complaint's department
- Complaint must not already be assigned

---

### 8. Add Remark to Complaint
**Endpoint:** `POST /api/complaints/:id/remarks`  
**Auth:** All authenticated users  
**Description:** Add a remark/comment to a complaint

**Request Body:**
```json
{
  "text": "Site visit completed. Repair scheduled for tomorrow."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Remark added successfully",
  "complaint": { ... }
}
```

---

### 9. Get User Complaints
**Endpoint:** `GET /api/complaints/user/:userId`  
**Auth:** All authenticated users  
**Description:** Get complaints submitted by a specific user

**Query Parameters:** Same as Get All Complaints

**Response:** Same as Get All Complaints

---

### 10. Get Complaint Statistics
**Endpoint:** `GET /api/complaints/stats`  
**Auth:** Officer, Department Head, Super Admin  
**Description:** Get aggregate statistics about complaints

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 150,
    "pending": 45,
    "assigned": 30,
    "inProgress": 40,
    "resolved": 30,
    "rejected": 5,
    "critical": 10
  },
  "categoryStats": [
    { "_id": "roads", "count": 50 },
    { "_id": "water", "count": 30 },
    { "_id": "electricity", "count": 40 },
    { "_id": "sanitation", "count": 20 },
    { "_id": "public_safety", "count": 10 }
  ],
  "departmentStats": [
    { "_id": "Public Works", "count": 50 },
    { "_id": "Water Department", "count": 30 },
    { "_id": "Electricity Department", "count": 40 },
    { "_id": "Sanitation Department", "count": 20 },
    { "_id": "Police Department", "count": 10 }
  ]
}
```

---

## User Management APIs

### 11. Get All Departments
**Endpoint:** `GET /api/users/departments/list`  
**Auth:** Department Head, Super Admin  
**Description:** Get list of all departments

**Response:**
```json
{
  "success": true,
  "departments": [
    "Public Works",
    "Water Department",
    "Electricity Department",
    "Sanitation Department",
    "Police Department",
    "General Administration"
  ]
}
```

---

### 12. Get Officers by Department
**Endpoint:** `GET /api/users/officers/department/:department`  
**Auth:** Department Head, Super Admin  
**Description:** Get all active officers in a specific department

**Response:**
```json
{
  "success": true,
  "officers": [
    {
      "_id": "67a...",
      "name": "Officer Smith",
      "email": "smith@dept.gov",
      "department": "Electricity Department",
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 13. Get User by ID
**Endpoint:** `GET /api/users/:id`  
**Auth:** All authenticated users  
**Description:** Get user details by ID

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "67a...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen",
    "department": null,
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

### 14. Update User Profile
**Endpoint:** `PATCH /api/users/:id`  
**Auth:** All authenticated users  
**Description:** Update user profile

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

### 15. Change Password
**Endpoint:** `PATCH /api/users/:id/password`  
**Auth:** All authenticated users  
**Description:** Change user password

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Authentication APIs

### 16. Register
**Endpoint:** `POST /api/auth/register`  
**Auth:** Public  
**Description:** Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "citizen"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67a...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen"
  }
}
```

---

### 17. Login
**Endpoint:** `POST /api/auth/login`  
**Auth:** Public  
**Description:** Login with email and password

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as Register

---

## Error Responses

All endpoints may return error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error information (in development)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Department Mapping

Complaint categories are automatically mapped to departments:

| Category | Department |
|----------|------------|
| roads | Public Works |
| water | Water Department |
| electricity | Electricity Department |
| sanitation | Sanitation Department |
| public_safety | Police Department |
| other | General Administration |

---

## Status Workflow

```
pending → assigned → in_progress → resolved
                  ↘ rejected
pending ↛ rejected (can reject directly)
```

- Once `resolved` or `rejected`, status cannot be changed
- Priority can be changed at any time by Department Head or Super Admin
- Status changes are logged in `statusHistory` array with notes
