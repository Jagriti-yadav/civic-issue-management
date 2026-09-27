import express from 'express';
import {
  getUserById,
  updateUser,
  changePassword
} from '../controllers/userController.js';

const router = express.Router();

// Get user by ID
router.get('/:id', getUserById);

// Update user profile
router.patch('/:id', updateUser);

// Change password
router.patch('/:id/password', changePassword);

export default router;