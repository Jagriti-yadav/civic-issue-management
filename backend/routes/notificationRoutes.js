import express from 'express';
import {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// Create new notification
router.post('/', createNotification);

// Get all notifications for a user
router.get('/user/:userId', getUserNotifications);

// Get unread notification count for a user
router.get('/user/:userId/unread-count', getUnreadCount);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read for a user
router.patch('/user/:userId/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

export default router;