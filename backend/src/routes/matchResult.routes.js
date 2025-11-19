import express from 'express';
import {
  createMatchResult,
  getAllMatchResults,
  getMatchResultById,
  updateMatchResult,
  deleteMatchResult,
  verifyMatchResult,
  getMatchResultsByEvent,
  getMatchStatistics,
  getDerbyChampionshipStandings,
  updateMatchResultPrizeAmount,
  updateFastestKillPrizeDistribution
} from '../controllers/matchResult.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes - require authentication
router.get('/', verifyToken, getAllMatchResults);
router.get('/statistics', verifyToken, getMatchStatistics);

// Specific routes that must come before parameterized routes
router.get('/event/:eventID', verifyToken, getMatchResultsByEvent);
router.get('/derby-championship/:eventID', verifyToken, getDerbyChampionshipStandings);
router.put('/fastest-kill/:eventID/prize-distribution', verifyToken, requireRole(['admin', 'bet_staff']), updateFastestKillPrizeDistribution);

// Routes requiring admin, bet_staff role
router.post('/', verifyToken, requireRole(['admin', 'bet_staff']), createMatchResult);
router.put('/:id', verifyToken, requireRole(['admin', 'bet_staff']), updateMatchResult);
router.patch('/:id/prize-amount', verifyToken, requireRole(['admin', 'bet_staff']), updateMatchResultPrizeAmount);
router.delete('/:id', verifyToken, requireRole(['admin', 'bet_staff']), deleteMatchResult);

// Routes requiring admin role for verification
router.patch('/:id/verify', verifyToken, requireRole(['admin']), verifyMatchResult);

// General routes (must come last)
router.get('/:id', verifyToken, getMatchResultById);

export default router;
