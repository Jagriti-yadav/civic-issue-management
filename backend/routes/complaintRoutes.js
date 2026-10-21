import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  getComplaintByComplaintId,
  updateComplaintStatus,
  updateComplaintPriority,
  assignComplaint,
  addRemark,
  getComplaintStats,
  getUserComplaints
} from '../controllers/complaintController.js';

const router = express.Router();

// Create new complaint (citizen only)
router.post('/', auth, authorize('citizen', 'officer', 'department_head', 'super_admin'), createComplaint);

// Get all complaints with optional filters (officer, department_head, super_admin)
router.get('/', auth, authorize('officer', 'department_head', 'super_admin'), getAllComplaints);

// Get complaints for a specific user (authenticated users)
router.get('/user/:userId', auth, getUserComplaints);

// Get complaint statistics (officer, department_head, super_admin)
router.get('/stats', auth, authorize('officer', 'department_head', 'super_admin'), getComplaintStats);

// Get complaint by complaint ID (for public tracking - no auth required)
router.get('/track/:complaintId', getComplaintByComplaintId);

// Get complaint by ID (authenticated users)
router.get('/:id', auth, getComplaintById);

// Update complaint status (officer, department_head, super_admin)
router.patch('/:id/status', auth, authorize('officer', 'department_head', 'super_admin'), updateComplaintStatus);

// Update complaint priority (department_head, super_admin)
router.patch('/:id/priority', auth, authorize('department_head', 'super_admin'), updateComplaintPriority);

// Assign complaint to officer (department_head, super_admin)
router.patch('/:id/assign', auth, authorize('department_head', 'super_admin'), assignComplaint);

// Add remark to complaint (authenticated users)
router.post('/:id/remarks', auth, addRemark);

export default router;