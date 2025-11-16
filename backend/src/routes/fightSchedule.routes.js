import express from 'express';
import {
  createFightSchedule,
  getAllFightSchedules,
  getFightScheduleById,
  updateFightSchedule,
  deleteFightSchedule,
  getFightSchedulesByEvent,
  updateFightStatus,
  getAvailableParticipants
} from '../controllers/fightSchedule.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes - require authentication
router.get('/', verifyToken, getAllFightSchedules);
router.get('/:id', verifyToken, getFightScheduleById);
router.get('/event/:eventID', verifyToken, getFightSchedulesByEvent);
router.get('/event/:eventID/available-participants', verifyToken, getAvailableParticipants);

// Routes requiring admin, bet_staff role
router.post('/', verifyToken, requireRole(['admin', 'bet_staff', 'registration_staff']), createFightSchedule);
router.put('/:id', verifyToken, requireRole(['admin', 'bet_staff', 'registration_staff']), updateFightSchedule);
router.patch('/:id/status', verifyToken, requireRole(['admin', 'bet_staff', 'registration_staff']), updateFightStatus);
router.delete('/:id', verifyToken, requireRole(['admin', 'bet_staff', 'registration_staff']), deleteFightSchedule);

export default router;
