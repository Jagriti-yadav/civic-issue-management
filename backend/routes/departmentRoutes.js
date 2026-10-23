import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  getDepartmentOfficers,
  getDepartmentComplaints
} from '../controllers/departmentController.js';

const router = express.Router();

// Super Admin routes for department management
// Create department (super_admin only)
router.post('/', auth, authorize('super_admin'), createDepartment);

// Get all departments with statistics (super_admin only)
router.get('/', auth, authorize('super_admin'), getDepartments);

// Get department officers (super_admin only) - must come before /:id
router.get('/:id/officers', auth, authorize('super_admin'), getDepartmentOfficers);

// Get department complaints (super_admin only) - must come before /:id
router.get('/:id/complaints', auth, authorize('super_admin'), getDepartmentComplaints);

// Get department by ID (super_admin only)
router.get('/:id', auth, authorize('super_admin'), getDepartmentById);

// Update department (super_admin only)
router.patch('/:id', auth, authorize('super_admin'), updateDepartment);

export default router;
