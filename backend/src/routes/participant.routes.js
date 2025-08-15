import express from 'express';
import { registerParticipant, getAllParticipants, getParticipantById, updateParticipant, updateParticipantStatus, deleteParticipant, getParticipantsByEvent } from '../controllers/participant.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes - require authentication
router.get('/', verifyToken, getAllParticipants);
router.get('/:id', verifyToken, getParticipantById);
router.get('/event/:eventID', verifyToken, getParticipantsByEvent);

// Routes requiring admin, event_staff, or registration_staff role
router.post('/', verifyToken, requireRole(['admin', 'registration_staff']), registerParticipant);
router.put('/:id', verifyToken, requireRole(['admin', 'event_staff', 'registration_staff']), updateParticipant);
router.patch('/:id/status', verifyToken, requireRole(['admin', 'event_staff', 'registration_staff']), updateParticipantStatus);
router.delete('/:id', verifyToken, requireRole(['admin', 'registration_staff']), deleteParticipant);

export default router;
