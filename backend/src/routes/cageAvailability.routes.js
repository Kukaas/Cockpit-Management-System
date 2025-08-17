import express from 'express';
import {
    createCageAvailability,
    bulkCreateCageAvailability,
    getAllCageAvailability,
    getCageAvailabilityById,
    updateCageAvailability,
    deleteCageAvailability,
    getAvailableCagesForRental,
    getCageAvailabilitySummary
} from '../controllers/cageAvailability.controller.js';
import {
    verifyToken,
    requireRole
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/summary', getCageAvailabilitySummary);

// Protected routes - All authenticated users can view cage availability
router.get('/available-for-rental', verifyToken, getAvailableCagesForRental);
router.get('/', verifyToken, getAllCageAvailability);
router.get('/:id', verifyToken, getCageAvailabilityById);

// Admin and staff routes
router.post('/', verifyToken, requireRole(['admin', 'tangkal_staff']), createCageAvailability);
router.post('/bulk', verifyToken, requireRole(['admin', 'tangkal_staff']), bulkCreateCageAvailability);
router.put('/:id', verifyToken, requireRole(['admin', 'tangkal_staff']), updateCageAvailability);
router.delete('/:id', verifyToken, requireRole(['admin', 'tangkal_staff']), deleteCageAvailability);

export default router;
