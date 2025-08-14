import express from 'express';
import {
    createStaffAccount,
    verifyEmail,
    resendVerificationEmail,
    getAllStaff,
    getStaffById,
    toggleStaffStatus,
    updateStaffAccount,
    deleteStaffAccount
} from '../controllers/staff.controller.js';
import {
    verifyToken,
    requireRole
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// Protected routes (admin only)
router.post('/', verifyToken, requireRole('admin'), createStaffAccount);
router.get('/', verifyToken, requireRole('admin'), getAllStaff);
router.get('/:id', verifyToken, requireRole('admin'), getStaffById);
router.patch('/:id/status', verifyToken, requireRole('admin'), toggleStaffStatus);
router.put('/:id', verifyToken, requireRole('admin'), updateStaffAccount);
router.delete('/:id', verifyToken, requireRole('admin'), deleteStaffAccount);

export default router;
