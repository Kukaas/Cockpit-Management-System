import express from 'express';
import {
    createCageRental,
    getAllCageRentals,
    getCageRentalById,
    updateCageRental,
    deleteCageRental,
    updatePaymentStatus,
    updateRentalStatus,
    getCageRentalsByEvent,
    getOverdueRentals,
    getAvailableCages,
    getAvailabilityStatus,
    getRentalSummary
} from '../controllers/cageRental.controller.js';
import {
    verifyToken,
    requireRole
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/available', getAvailableCages);
router.get('/availability-status', getAvailabilityStatus);

// Protected routes - All authenticated users can view cage rentals
router.get('/', verifyToken, getAllCageRentals);
router.get('/summary', verifyToken, getRentalSummary);
router.get('/:id', verifyToken, getCageRentalById);
router.get('/event/:eventId', verifyToken, getCageRentalsByEvent);
router.get('/overdue', verifyToken, getOverdueRentals);

// Admin and staff routes
router.post('/', verifyToken, requireRole(['admin', 'tangkal_staff']), createCageRental);
router.put('/:id', verifyToken, requireRole(['admin', 'tangkal_staff']), updateCageRental);
router.patch('/:id/payment-status', verifyToken, requireRole(['admin', 'tangkal_staff']), updatePaymentStatus);
router.patch('/:id/rental-status', verifyToken, requireRole(['admin', 'tangkal_staff']), updateRentalStatus);
router.delete('/:id', verifyToken, requireRole(['admin', 'tangkal_staff']), deleteCageRental);

export default router;
