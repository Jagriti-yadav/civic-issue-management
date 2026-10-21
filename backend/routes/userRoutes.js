import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import {
  getDepartments,
  getOfficersByDepartment,
  getUserById,
  updateUser,
  changePassword
} from '../controllers/userController.js';

const router = express.Router();

// Specific routes must come before parameterized routes
// Get all departments (admin, department_head, super_admin)
router.get('/departments/list', auth, authorize('department_head', 'super_admin'), getDepartments);

// Get officers by department (admin, department_head, super_admin)
router.get('/officers/department/:department', auth, authorize('department_head', 'super_admin'), getOfficersByDepartment);

// Get user by ID (authenticated users) - must be last to avoid conflicts
router.get('/:id', auth, getUserById);

// Update user profile (authenticated users)
router.patch('/:id', auth, updateUser);

// Change password (authenticated users)
router.patch('/:id/password', auth, changePassword);

export default router;