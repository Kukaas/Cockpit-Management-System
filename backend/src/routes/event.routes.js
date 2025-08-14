import express from 'express';
import {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    getEventsByAdmin,
    getUpcomingEvents
} from '../controllers/event.controller.js';
import {
    verifyToken,
    requireRole
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/upcoming', getUpcomingEvents);

// Protected routes - All authenticated users can view events
router.get('/', verifyToken, getAllEvents);
router.get('/:id', verifyToken, getEventById);

// Admin and event creator routes
router.post('/', verifyToken, requireRole(['admin', 'event_staff']), createEvent);
router.put('/:id', verifyToken, requireRole(['admin', 'event_staff']), updateEvent);
router.patch('/:id/status', verifyToken, requireRole(['admin', 'event_staff']), updateEventStatus);
router.delete('/:id', verifyToken, requireRole(['admin', 'event_staff']), deleteEvent);

// Admin only routes
router.get('/admin/:adminId', verifyToken, requireRole('admin'), getEventsByAdmin);

export default router;
