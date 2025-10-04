import express from 'express';
import { createCockProfile, getAllCockProfiles, getCockProfileById, updateCockProfile, deleteCockProfile, getCockProfilesByParticipant, getCockProfilesByEvent } from '../controllers/cockProfile.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (if needed)
// router.get('/public', getPublicCockProfiles);

// Protected routes - require authentication
router.get('/', verifyToken, getAllCockProfiles);
router.get('/event/:eventID', verifyToken, getCockProfilesByEvent);
router.get('/:id', verifyToken, getCockProfileById);
router.get('/participant/:participantID', verifyToken, getCockProfilesByParticipant);

// Routes requiring admin or registration_staff role for modification, bet_staff can view
router.post('/', verifyToken, requireRole(['admin', 'registration_staff']), createCockProfile);
router.put('/:id', verifyToken, requireRole(['admin', 'bet_staff', 'registration_staff']), updateCockProfile);
router.delete('/:id', verifyToken, requireRole(['admin', 'registration_staff']), deleteCockProfile);

export default router;
