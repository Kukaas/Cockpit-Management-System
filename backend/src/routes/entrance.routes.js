import express from 'express';
import {
  recordEntrance,
  getAllEntrances,
  getEntranceById,
  updateEntrance,
  deleteEntrance,
  getEntrancesByEvent,
  getEntranceStats,
  getCapacityStatus
} from '../controllers/entrance.controller.js';
import {
  verifyToken,
  requireRole
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes - require authentication
router.get('/', verifyToken, getAllEntrances);
router.get('/event/:eventID', verifyToken, getEntrancesByEvent);
router.get('/stats/:eventID', verifyToken, getEntranceStats);
router.get('/capacity/:eventID', verifyToken, getCapacityStatus);
router.get('/:id', verifyToken, getEntranceById);

// Routes requiring admin, bet_staff, or entrance_staff role
router.post('/', verifyToken, requireRole(['admin', 'bet_staff', 'entrance_staff']), recordEntrance);
router.put('/:id', verifyToken, requireRole(['admin', 'bet_staff', 'entrance_staff']), updateEntrance);
router.delete('/:id', verifyToken, requireRole(['admin', 'bet_staff', 'entrance_staff']), deleteEntrance);

export default router;
