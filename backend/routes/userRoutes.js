import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import {
  createOfficer,
  getOfficers,
  updateOfficer,
  getOfficerComplaints,
  getAllUsers,
  updateUserStatus,
  getUserComplaints,
  getDepartments,
  getOfficersByDepartment,
  getDepartmentOfficersWithWorkload,
  getOfficerDetailsForDepartmentHead,
  getUserById,
  updateUser,
  changePassword,
  createDepartmentHead,
  createSuperAdmin
} from '../controllers/userController.js';

const router = express.Router();

// Specific routes must come before parameterized routes
// Get all departments (admin, department_head, super_admin)
router.get('/departments/list', auth, authorize('department_head', 'super_admin'), getDepartments);

// Get officers by department (admin, department_head, super_admin) - must come before /officers/:id
router.get('/officers/department/:department', auth, authorize('department_head', 'super_admin'), getOfficersByDepartment);

// Department Head routes for officer management
// Get officers with workload for Department Head
router.get('/officers/department-head/workload', auth, authorize('department_head'), getDepartmentOfficersWithWorkload);

// Get officer details with assigned complaints for Department Head
router.get('/officers/department-head/:id', auth, authorize('department_head'), getOfficerDetailsForDepartmentHead);

// Super Admin routes for officer management
// Create officer account (super_admin only)
router.post('/officers', auth, authorize('super_admin'), createOfficer);

// Create department head account (super_admin only)
router.post('/department-heads', auth, authorize('super_admin'), createDepartmentHead);

// Create super admin account (super_admin only - for creating additional admins)
router.post('/super-admins', auth, authorize('super_admin'), createSuperAdmin);

// Get all officers with filters (super_admin only)
router.get('/officers', auth, authorize('super_admin'), getOfficers);

// Get officer's assigned complaints (super_admin only) - must come before /officers/:id
router.get('/officers/:id/complaints', auth, authorize('super_admin'), getOfficerComplaints);

// Update officer details (super_admin only)
router.patch('/officers/:id', auth, authorize('super_admin'), updateOfficer);

// Super Admin routes for user management
// Get all users with pagination, search, and filters (super_admin only)
router.get('/all', auth, authorize('super_admin'), getAllUsers);

// Update user status (activate/deactivate) (super_admin only)
router.patch('/:id/status', auth, authorize('super_admin'), updateUserStatus);

// Get user's complaints (super_admin only)
router.get('/:id/complaints', auth, authorize('super_admin'), getUserComplaints);

// Get user by ID (authenticated users) - must be last to avoid conflicts
router.get('/:id', auth, getUserById);

// Update user profile (authenticated users)
router.patch('/:id', auth, updateUser);

// Change password (authenticated users)
router.patch('/:id/password', auth, changePassword);

export default router;