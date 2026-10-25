import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import {
  getDashboardStats,
  getDashboardTrends,
  getRecentComplaints,
  getRecentUsers,
  getDepartmentHeadDashboardStats
} from '../controllers/dashboardController.js';

const router = express.Router();

// Get dashboard statistics (super_admin only)
router.get('/stats', auth, authorize('super_admin'), getDashboardStats);

// Get dashboard trends (super_admin only)
router.get('/trends', auth, authorize('super_admin'), getDashboardTrends);

// Get recent complaints (super_admin only)
router.get('/recent-complaints', auth, authorize('super_admin'), getRecentComplaints);

// Get recent users (super_admin only)
router.get('/recent-users', auth, authorize('super_admin'), getRecentUsers);

// Get department head dashboard statistics (department_head only)
router.get('/department-head/stats', auth, authorize('department_head'), getDepartmentHeadDashboardStats);

export default router;
