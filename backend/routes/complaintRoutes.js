import express from 'express';
import {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  getComplaintByComplaintId,
  updateComplaintStatus,
  assignComplaint,
  addRemark,
  getComplaintStats,
  getUserComplaints
} from '../controllers/complaintController.js';

const router = express.Router();

// Create new complaint
router.post('/', createComplaint);

// Get all complaints with optional filters
router.get('/', getAllComplaints);

// Get complaints for a specific user
router.get('/user/:userId', getUserComplaints);

// Get complaint statistics
router.get('/stats', getComplaintStats);

// Get complaint by complaint ID (for public tracking)
router.get('/track/:complaintId', getComplaintByComplaintId);

// Get complaint by ID
router.get('/:id', getComplaintById);

// Update complaint status
router.patch('/:id/status', updateComplaintStatus);

// Assign complaint to officer
router.patch('/:id/assign', assignComplaint);

// Add remark to complaint
router.post('/:id/remarks', addRemark);

export default router;