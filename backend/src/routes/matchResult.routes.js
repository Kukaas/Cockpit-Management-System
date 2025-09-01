import express from 'express';
import {
  createMatchResult,
  getAllMatchResults,
  getMatchResultById,
  updateMatchResult,
  updateMatchResultStatus,
  deleteMatchResult,
  verifyMatchResult,
  getMatchResultsByEvent,
  getMatchStatistics,
  getDerbyChampionshipStandings
} from '../controllers/matchResult.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes - require authentication
router.get('/', verifyToken, getAllMatchResults);
router.get('/statistics', verifyToken, getMatchStatistics);
router.get('/:id', verifyToken, getMatchResultById);
router.get('/event/:eventID', verifyToken, getMatchResultsByEvent);

// Routes requiring admin, event_staff role
router.post('/', verifyToken, requireRole(['admin', 'event_staff']), createMatchResult);
router.put('/:id', verifyToken, requireRole(['admin', 'event_staff']), updateMatchResult);
router.patch('/:id/status', verifyToken, requireRole(['admin', 'event_staff']), updateMatchResultStatus);
router.delete('/:id', verifyToken, requireRole(['admin', 'event_staff']), deleteMatchResult);

// Get derby championship standings
router.get('/derby-championship/:eventID', verifyToken, getDerbyChampionshipStandings);

// Routes requiring admin role for verification
router.patch('/:id/verify', verifyToken, requireRole(['admin']), verifyMatchResult);

export default router;
