import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// Create new notification (system use - typically super_admin only)
router.post('/', auth, createNotification);

// Get all notifications for a user (authenticated users)
router.get('/user/:userId', auth, getUserNotifications);

// Get unread notification count for a user (authenticated users)
router.get('/user/:userId/unread-count', auth, getUnreadCount);

// Mark notification as read (authenticated users)
router.patch('/:id/read', auth, markAsRead);

// Mark all notifications as read for a user (authenticated users)
router.patch('/user/:userId/read-all', auth, markAllAsRead);

// Delete notification (authenticated users)
router.delete('/:id', auth, deleteNotification);

export default router;