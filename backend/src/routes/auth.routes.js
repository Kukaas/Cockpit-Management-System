import express from 'express';
import {
    login,
    register,
    refreshToken,
    logout,
    getCurrentUser
} from '../controllers/auth.controller.js';
import {
    verifyToken,
    verifyRefreshToken,
    requireRole
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.post('/register', verifyToken, requireRole('admin'), register);
router.post('/refresh', verifyRefreshToken, refreshToken);
router.get('/me', verifyToken, getCurrentUser);

export default router;
