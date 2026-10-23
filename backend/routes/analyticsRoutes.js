import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import {
  getAnalyticsOverview,
  getComplaintsByCategory,
  getComplaintsByStatus,
  getComplaintsByDepartment,
  getComplaintTrends,
  getOfficerPerformance,
  getAllAnalytics
} from '../controllers/analyticsController.js';

const router = express.Router();

// All analytics routes require super_admin role

// Get comprehensive analytics overview
router.get('/overview', auth, authorize('super_admin'), getAnalyticsOverview);

// Get complaints grouped by category
router.get('/by-category', auth, authorize('super_admin'), getComplaintsByCategory);

// Get complaints grouped by status
router.get('/by-status', auth, authorize('super_admin'), getComplaintsByStatus);

// Get complaints grouped by department
router.get('/by-department', auth, authorize('super_admin'), getComplaintsByDepartment);

// Get complaint submission trends
router.get('/trends', auth, authorize('super_admin'), getComplaintTrends);

// Get officer performance metrics
router.get('/officer-performance', auth, authorize('super_admin'), getOfficerPerformance);

// Get all analytics data in a single call
router.get('/all', auth, authorize('super_admin'), getAllAnalytics);

export default router;
