import MatchResult from '../models/matchResult.model.js';
import FightSchedule from '../models/fightSchedule.model.js';
import Participant from '../models/participant.model.js';
import CockProfile from '../models/cockProfile.model.js';
import Event from '../models/event.model.js';

// Create a match result
export const createMatchResult = async (req, res) => {
  try {
    const {
      matchID,
      participantBets = [], // Array of {participantID, betAmount}
      winnerParticipantID,
      loserParticipantID,
      winnerCockProfileID,
      loserCockProfileID,
      matchTimeSeconds
    } = req.body;
    const recordedBy = req.user.id;
    const outcomeKey = typeof winnerParticipantID === 'string' ? winnerParticipantID.toLowerCase() : '';
    const isDrawOutcome = outcomeKey === 'draw';
    const isCancelledOutcome = outcomeKey === 'cancelled';
    const isSpecialOutcome = isDrawOutcome || isCancelledOutcome;
    const specialBetWinner = isDrawOutcome ? 'Draw' : isCancelledOutcome ? 'Cancelled' : null;

    // Validate fight schedule exists
    const fightSchedule = await FightSchedule.findById(matchID)
      .populate('participantsID', 'participantName')
      .populate('cockProfileID', 'legband weight entryNo ownerName')
      .populate('eventID', 'eventType');

    if (!fightSchedule) {
      return res.status(404).json({ message: 'Fight schedule not found' });
    }

    // Get event type for validation
    const event = await Event.findById(fightSchedule.eventID);
    const eventType = event?.eventType;

    // Validate matchTimeSeconds for fastest kill events
    // Note: Frontend sends total seconds (converted from minutes + seconds)
    if (eventType === 'fastest_kill' && !isSpecialOutcome) {
      if (matchTimeSeconds === undefined || matchTimeSeconds === null) {
        return res.status(400).json({ message: 'Match time (in seconds) is required for fastest kill events' });
      }
      if (typeof matchTimeSeconds !== 'number' || matchTimeSeconds < 0) {
        return res.status(400).json({ message: 'Match time must be a non-negative number' });
      }
      // Validate reasonable time range (0 to 10 minutes = 600 seconds)
      if (matchTimeSeconds > 600) {
        return res.status(400).json({ message: 'Match time cannot exceed 600 seconds (10 minutes)' });
      }
    }

    // Check if fight is in correct status for result recording
    if (fightSchedule.status === 'completed') {
      return res.status(400).json({ message: 'Match result already exists for this completed fight' });
    }

    // Check if result already exists
    const existingResult = await MatchResult.findOne({ matchID });
    if (existingResult) {
      return res.status(400).json({ message: 'Match result already exists for this fight' });
    }

    if (!isSpecialOutcome) {
      // Validate participants are part of this fight
      const participantIDs = fightSchedule.participantsID.map(p => p._id.toString());
      if (!participantIDs.includes(winnerParticipantID) || !participantIDs.includes(loserParticipantID)) {
        return res.status(400).json({ message: 'Participants must be part of this fight' });
      }

      // Validate cock profiles
      const cockProfileIDs = fightSchedule.cockProfileID.map(c => c._id.toString());
      if (!cockProfileIDs.includes(winnerCockProfileID) || !cockProfileIDs.includes(loserCockProfileID)) {
        return res.status(400).json({ message: 'Cock profiles must be part of this fight' });
      }

      // Validate participant bets
      if (!participantBets || participantBets.length !== 2) {
        return res.status(400).json({ message: 'Exactly 2 participant bets are required' });
      }

      // Validate that all participants in the fight have bets
      const betParticipantIDs = participantBets.map(bet => bet.participantID);
      const missingParticipants = participantIDs.filter(id => !betParticipantIDs.includes(id));
      if (missingParticipants.length > 0) {
        return res.status(400).json({ message: 'All participants must have bets' });
      }
    }

    // Calculate betting totals
    let totalBetPool = 0;
    if (!isSpecialOutcome && participantBets.length === 2) {
      const [bet1, bet2] = participantBets
      const meronBet = bet1.betAmount > bet2.betAmount ? bet1 : bet2
      const walaBet = bet1.betAmount > bet2.betAmount ? bet2 : bet1

      const gap = Math.max(0, meronBet.betAmount - walaBet.betAmount) // Gap filled by outside bets (only positive)
      totalBetPool = meronBet.betAmount + walaBet.betAmount + gap // Total: Meron + Wala + Outside bets
    }

    // Calculate plazada (will be calculated in the model based on loser)
    // NEW: Plazada is now only collected from the loser (10% of loser's bet)
    const totalPlazada = 0 // This will be calculated in the model after betWinner is determined

    // Create match result
    const matchResult = new MatchResult({
      matchID,
      participantBets: isSpecialOutcome ? [] : participantBets,
      totalBetPool,
      totalPlazada,
      resultMatch: {
        ...(isSpecialOutcome ? {} : {
          winnerParticipantID,
          loserParticipantID,
          winnerCockProfileID,
          loserCockProfileID
        })
      },
      matchTimeSeconds,
      recordedBy
    });

    if (isSpecialOutcome) {
      matchResult.betWinner = specialBetWinner;
      matchResult.participantBets = [];
      matchResult.totalBetPool = 0;
      matchResult.totalPlazada = 0;
    } else {
      // Assign Meron/Wala positions based on bet amounts
      matchResult.assignPositions();

      // Determine bet winner based on participant
      matchResult.determineBetWinner();
    }

    // Validate the result
    const validationErrors = matchResult.validateResult();
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: 'Validation errors', errors: validationErrors });
    }

    await matchResult.save();

    // Update fight schedule status to completed
    const updatedFightSchedule = await FightSchedule.findByIdAndUpdate(matchID, {
      status: 'completed'
    }, {
      new: true,
      runValidators: true
    });

    if (!updatedFightSchedule) {
      console.error('Failed to update fight schedule status to completed');
    }

    // Deactivate the cock profiles that participated in this fight and set status to 'fought'
    if (!isSpecialOutcome) {
      try {
        await CockProfile.updateMany(
          {
            _id: {
              $in: [winnerCockProfileID, loserCockProfileID]
            }
          },
          { isActive: false, status: 'fought' }
        );
      } catch (error) {
        console.error('Error deactivating cock profiles:', error);
      }
    }

    // Populate references for response
    await matchResult.populate([
      { path: 'matchID', select: 'fightNumber eventID' },
      { path: 'participantBets.participantID', select: 'participantName contactNumber' },
      { path: 'resultMatch.winnerParticipantID', select: 'participantName contactNumber' },
      { path: 'resultMatch.loserParticipantID', select: 'participantName contactNumber' },
      { path: 'resultMatch.winnerCockProfileID', select: 'legband weight entryNo ownerName' },
      { path: 'resultMatch.loserCockProfileID', select: 'legband weight entryNo ownerName' },
      { path: 'recordedBy', select: 'username' }
    ]);

    res.status(201).json({
      message: 'Match result created successfully',
      data: matchResult
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create match result', error: error.message });
  }
};

// Get all match results (with filtering)
export const getAllMatchResults = async (req, res) => {
  try {
    const { betWinner, verified } = req.query;

    let query = {};

    // Filter by bet winner
    if (betWinner) {
      query.betWinner = betWinner;
    }

    // Filter by verification status
    if (verified !== undefined) {
      query.verified = verified === 'true';
    }

    const matchResults = await MatchResult.find(query)
      .populate({
        path: 'matchID',
        select: 'fightNumber eventID',
        populate: {
          path: 'eventID',
          select: 'eventName date location'
        }
      })
      .populate('participantBets.participantID', 'participantName')
      .populate('resultMatch.winnerParticipantID', 'participantName')
      .populate('resultMatch.loserParticipantID', 'participantName')
      .populate('resultMatch.winnerCockProfileID', 'legband weight entryNo ownerName')
      .populate('resultMatch.loserCockProfileID', 'legband weight entryNo ownerName')
      .populate('recordedBy', 'username')
      .populate('verifiedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      data: matchResults
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch match results', error: error.message });
  }
};

// Get match result by ID
export const getMatchResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const matchResult = await MatchResult.findById(id)
      .populate({
        path: 'matchID',
        select: 'fightNumber eventID participantsID cockProfileID',
        populate: [
          { path: 'eventID', select: 'eventName date location' },
          { path: 'participantsID', select: 'participantName contactNumber' },
          { path: 'cockProfileID', select: 'legband weight entryNo ownerName' }
        ]
      })
      .populate('participantBets.participantID', 'participantName contactNumber email')
      .populate('resultMatch.winnerParticipantID', 'participantName contactNumber email')
      .populate('resultMatch.loserParticipantID', 'participantName contactNumber email')
      .populate('resultMatch.winnerCockProfileID', 'legband weight entryNo ownerName')
      .populate('resultMatch.loserCockProfileID', 'legband weight entryNo ownerName')
      .populate('recordedBy', 'username')
      .populate('verifiedBy', 'username');

    if (!matchResult) {
      return res.status(404).json({ message: 'Match result not found' });
    }

    res.json({ data: matchResult });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch match result', error: error.message });
  }
};

// Update match result
export const updateMatchResult = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      participantBets,
      winnerParticipantID,
      loserParticipantID,
      winnerCockProfileID,
      loserCockProfileID,
      matchTimeSeconds
    } = req.body;

    const matchResult = await MatchResult.findById(id)
      .populate({
        path: 'matchID',
        populate: { path: 'eventID', select: 'eventType' }
      });

    if (!matchResult) {
      return res.status(404).json({ message: 'Match result not found' });
    }

    const selectionKey = typeof winnerParticipantID === 'string' ? winnerParticipantID.toLowerCase() : '';
    const isDrawSelection = selectionKey === 'draw';
    const isCancelledSelection = selectionKey === 'cancelled';
    const isSpecialSelection = isDrawSelection || isCancelledSelection;
    const specialSelectionValue = isDrawSelection ? 'Draw' : isCancelledSelection ? 'Cancelled' : null;

    // Get event type for validation
    const eventType = matchResult.matchID?.eventID?.eventType;

    // Validate matchTimeSeconds for fastest kill events
    // Note: Frontend sends total seconds (converted from minutes + seconds)
    if (matchTimeSeconds !== undefined && eventType === 'fastest_kill' && !isSpecialSelection) {
      if (matchTimeSeconds === null) {
        return res.status(400).json({ message: 'Match time (in seconds) is required for fastest kill events' });
      }
      if (typeof matchTimeSeconds !== 'number' || matchTimeSeconds < 0) {
        return res.status(400).json({ message: 'Match time must be a non-negative number' });
      }
      // Validate reasonable time range (0 to 10 minutes = 600 seconds)
      if (matchTimeSeconds > 600) {
        return res.status(400).json({ message: 'Match time cannot exceed 600 seconds (10 minutes)' });
      }
    }

    // Check if result is already verified and final
    if (matchResult.verified) {
      return res.status(400).json({ message: 'Cannot update a verified match result' });
    }

    // Update participant bets if provided
    if (!isSpecialSelection && participantBets && participantBets.length === 2) {
      matchResult.participantBets = participantBets;
      matchResult.assignPositions();

      // Recalculate betting totals
      const [bet1, bet2] = participantBets;
      const meronBet = bet1.betAmount > bet2.betAmount ? bet1 : bet2;
      const walaBet = bet1.betAmount > bet2.betAmount ? bet2 : bet1;

      const gap = Math.max(0, meronBet.betAmount - walaBet.betAmount); // Gap filled by outside bets (only positive)
      const totalBetPool = meronBet.betAmount + walaBet.betAmount + gap; // Total: Meron + Wala + Outside bets

      // Plazada will be calculated in the model based on loser
      // NEW: Plazada is now only collected from the loser (10% of loser's bet)
      matchResult.totalBetPool = totalBetPool;
      // totalPlazada will be calculated in the model after betWinner is determined
    }

    if (isSpecialSelection) {
      matchResult.betWinner = specialSelectionValue;
      matchResult.participantBets = [];
      matchResult.totalBetPool = 0;
      matchResult.totalPlazada = 0;
      matchResult.resultMatch.winnerParticipantID = undefined;
      matchResult.resultMatch.loserParticipantID = undefined;
      matchResult.resultMatch.winnerCockProfileID = undefined;
      matchResult.resultMatch.loserCockProfileID = undefined;
      matchResult.matchTimeSeconds = undefined;
    } else {
      // Update result match fields
      if (winnerParticipantID) matchResult.resultMatch.winnerParticipantID = winnerParticipantID;
      if (loserParticipantID) matchResult.resultMatch.loserParticipantID = loserParticipantID;
      if (winnerCockProfileID) matchResult.resultMatch.winnerCockProfileID = winnerCockProfileID;
      if (loserCockProfileID) matchResult.resultMatch.loserCockProfileID = loserCockProfileID;
      // Update timing
      if (matchTimeSeconds !== undefined) matchResult.matchTimeSeconds = matchTimeSeconds;
    }
    if (!isSpecialSelection && matchTimeSeconds === undefined && eventType !== 'fastest_kill') {
      // no-op, retain previous time if not provided
    }

    // Recalculate bet winner if participants changed
    if (!isSpecialSelection && winnerParticipantID) {
      matchResult.determineBetWinner();
    } else if (isSpecialSelection) {
      // betWinner already set
    }

    // Validate the updated result
    const validationErrors = matchResult.validateResult();
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: 'Validation errors', errors: validationErrors });
    }

    await matchResult.save();

    // Populate references for response
    await matchResult.populate([
      { path: 'matchID', select: 'fightNumber eventID' },
      { path: 'participantBets.participantID', select: 'participantName contactNumber' },
      { path: 'resultMatch.winnerParticipantID', select: 'participantName contactNumber' },
      { path: 'resultMatch.loserParticipantID', select: 'participantName contactNumber' },
      { path: 'resultMatch.winnerCockProfileID', select: 'legband weight entryNo ownerName' },
      { path: 'resultMatch.loserCockProfileID', select: 'legband weight entryNo ownerName' },
      { path: 'recordedBy', select: 'username' }
    ]);

    res.json({ message: 'Match result updated successfully', data: matchResult });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update match result', error: error.message });
  }
};

// Delete match result
export const deleteMatchResult = async (req, res) => {
  try {
    const { id } = req.params;
    const matchResult = await MatchResult.findById(id);

    if (!matchResult) {
      return res.status(404).json({ message: 'Match result not found' });
    }

    // Check if result is verified
    if (matchResult.verified) {
      return res.status(400).json({ message: 'Cannot delete a verified match result' });
    }

    // Update fight schedule status back to scheduled (ready for a new result)
    await FightSchedule.findByIdAndUpdate(matchResult.matchID, {
      status: 'scheduled'
    }, {
      new: true,
      runValidators: true
    });

    // Reactivate the cock profiles since the result is being deleted and set status back to 'scheduled'
    const cockIdsToReactivate = [
      matchResult.resultMatch?.winnerCockProfileID,
      matchResult.resultMatch?.loserCockProfileID
    ].filter(Boolean);

    if (cockIdsToReactivate.length > 0) {
      try {
        await CockProfile.updateMany(
          {
            _id: {
              $in: cockIdsToReactivate
            }
          },
          { isActive: true, status: 'scheduled' }
        );
      } catch (error) {
        console.error('Error reactivating cock profiles:', error);
      }
    }

    await MatchResult.findByIdAndDelete(id);
    res.json({ message: 'Match result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete match result', error: error.message });
  }
};

// Update match result status only
// Verify match result
export const verifyMatchResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    const verifiedBy = req.user.id;

    const matchResult = await MatchResult.findById(id);
    if (!matchResult) {
      return res.status(404).json({ message: 'Match result not found' });
    }

    matchResult.verified = verified;
    matchResult.verifiedBy = verified ? verifiedBy : null;
    matchResult.verifiedAt = verified ? new Date() : null;

    await matchResult.save();

    await matchResult.populate([
      { path: 'verifiedBy', select: 'username' },
      { path: 'recordedBy', select: 'username' }
    ]);

    res.json({
      message: `Match result ${verified ? 'verified' : 'unverified'} successfully`,
      data: matchResult
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify match result', error: error.message });
  }
};

// Get match results by event
export const getMatchResultsByEvent = async (req, res) => {
  try {
    const { eventID } = req.params;
    const { betWinner, verified } = req.query;

    // First get all fight schedules for this event
    let fightQuery = { eventID };
    const fightSchedules = await FightSchedule.find(fightQuery).select('_id');
    const matchIDs = fightSchedules.map(f => f._id);

    // Then get match results for these fights
    let query = { matchID: { $in: matchIDs } };

    if (betWinner) {
      query.betWinner = betWinner;
    }

    if (verified !== undefined) {
      query.verified = verified === 'true';
    }

    const matchResults = await MatchResult.find(query)
      .populate({
        path: 'matchID',
        select: 'fightNumber eventID',
        populate: {
          path: 'eventID',
          select: 'eventName'
        }
      })
      .populate('participantBets.participantID', 'participantName')
      .populate('resultMatch.winnerParticipantID', 'participantName')
      .populate('resultMatch.loserParticipantID', 'participantName')
      .populate('resultMatch.winnerCockProfileID', 'legband weight entryNo ownerName')
      .populate('resultMatch.loserCockProfileID', 'legband weight entryNo ownerName')
      .sort({ createdAt: -1 });

    res.json({ data: matchResults });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch match results for event', error: error.message });
  }
};

// Get match statistics
export const getMatchStatistics = async (req, res) => {
  try {
    const { eventID } = req.query;

    let matchQuery = {};
    if (eventID) {
      const fightSchedules = await FightSchedule.find({ eventID }).select('_id');
      const matchIDs = fightSchedules.map(f => f._id);
      matchQuery.matchID = { $in: matchIDs };
    }

    const stats = await MatchResult.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalMatches: { $sum: 1 },
          totalBetPool: { $sum: '$totalBetPool' },
          totalPlazada: { $sum: '$totalPlazada' },
          meronWins: {
            $sum: { $cond: [{ $eq: ['$betWinner', 'Meron'] }, 1, 0] }
          },
          walaWins: {
            $sum: { $cond: [{ $eq: ['$betWinner', 'Wala'] }, 1, 0] }
          },
          draws: {
            $sum: { $cond: [{ $eq: ['$betWinner', 'Draw'] }, 1, 0] }
          },
          verifiedMatches: {
            $sum: { $cond: ['$verified', 1, 0] }
          },
          avgMatchDuration: { $avg: '$resultMatch.matchDuration' }
        }
      }
    ]);

    const statistics = stats.length > 0 ? stats[0] : {
      totalMatches: 0,
      totalBetPool: 0,
      totalPlazada: 0,
      meronWins: 0,
      walaWins: 0,
      draws: 0,
      verifiedMatches: 0,
      avgMatchDuration: 0
    };

    res.json({ data: statistics });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch match statistics', error: error.message });
  }
};

// Get derby championship standings
export const getDerbyChampionshipStandings = async (req, res) => {
  try {
    const { eventID } = req.params;

    // Get event details to check if it's a derby and get requirements
    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.eventType !== 'derby') {
      return res.status(400).json({ message: 'This endpoint is only for derby events' });
    }

    // Get all match results for this event
    const fightSchedules = await FightSchedule.find({ eventID }).select('_id');
    const matchIDs = fightSchedules.map(f => f._id);

    if (matchIDs.length === 0) {
      return res.json({
        data: {
          event: { eventName: event.eventName, noCockRequirements: event.noCockRequirements, prize: event.prize },
          standings: [],
          totalMatches: 0,
          completedMatches: 0
        }
      });
    }

    const matchResults = await MatchResult.find({ matchID: { $in: matchIDs } })
      .populate('resultMatch.winnerParticipantID', 'participantName')
      .populate('resultMatch.loserParticipantID', 'participantName');

    // Count wins for each participant
    const participantWins = {};
    const participantMatches = {};

    matchResults.forEach(result => {
      const winnerId = result.resultMatch.winnerParticipantID._id.toString();
      const loserId = result.resultMatch.loserParticipantID._id.toString();

      // Count wins
      participantWins[winnerId] = (participantWins[winnerId] || 0) + 1;
      participantWins[loserId] = participantWins[loserId] || 0;

      // Count total matches
      participantMatches[winnerId] = (participantMatches[winnerId] || 0) + 1;
      participantMatches[loserId] = (participantMatches[loserId] || 0) + 1;
    });

    // Get all participants for this event
    const participants = await Participant.find({ eventID })
      .select('participantName contactNumber');

    // Create standings with win counts
    const standings = participants.map(participant => {
      const participantId = participant._id.toString();
      const wins = participantWins[participantId] || 0;
      const totalMatches = participantMatches[participantId] || 0;
      const losses = totalMatches - wins;
      const remainingCocks = event.noCockRequirements - totalMatches;
      const isChampion = wins >= event.noCockRequirements;
      const isEliminated = losses >= event.noCockRequirements;

      return {
        participant: {
          _id: participant._id,
          participantName: participant.participantName,
          contactNumber: participant.contactNumber
        },
        wins,
        losses,
        totalMatches,
        remainingCocks: Math.max(0, remainingCocks),
        isChampion,
        isEliminated,
        status: isChampion ? 'Champion' : isEliminated ? 'Eliminated' : 'Active'
      };
    });

    // Sort standings: champions first (by wins), then active participants (by wins), then eliminated
    standings.sort((a, b) => {
      if (a.isChampion && !b.isChampion) return -1;
      if (!a.isChampion && b.isChampion) return 1;
      if (a.isChampion && b.isChampion) return b.wins - a.wins;
      if (a.isEliminated && !b.isEliminated) return 1;
      if (!a.isEliminated && b.isEliminated) return -1;
      return b.wins - a.wins;
    });

    // Calculate prize distribution
    const champions = standings.filter(s => s.isChampion);
    const prizeDistribution = champions.map((champion, index) => {
      let prizePercentage = 0;
      let prizeAmount = 0;

      if (champions.length === 1) {
        // Single champion gets 100%
        prizePercentage = 100;
        prizeAmount = event.prize;
      } else if (champions.length === 2) {
        // 1st: 70%, 2nd: 30%
        prizePercentage = index === 0 ? 70 : 30;
        prizeAmount = Math.round((event.prize * prizePercentage) / 100);
      } else if (champions.length === 3) {
        // 1st: 50%, 2nd: 30%, 3rd: 20%
        if (index === 0) {
          prizePercentage = 50;
        } else if (index === 1) {
          prizePercentage = 30;
        } else {
          prizePercentage = 20;
        }
        prizeAmount = Math.round((event.prize * prizePercentage) / 100);
      } else if (champions.length >= 4) {
        // 1st: 40%, 2nd: 25%, 3rd: 20%, 4th+: 15% (divided equally)
        if (index === 0) {
          prizePercentage = 40;
        } else if (index === 1) {
          prizePercentage = 25;
        } else if (index === 2) {
          prizePercentage = 20;
        } else {
          prizePercentage = Math.round(15 / (champions.length - 3));
        }
        prizeAmount = Math.round((event.prize * prizePercentage) / 100);
      }

      return {
        ...champion,
        position: index + 1,
        prizePercentage,
        prizeAmount
      };
    });

    const totalMatches = matchIDs.length;
    const completedMatches = matchResults.length;

    res.json({
      data: {
        event: {
          eventName: event.eventName,
          noCockRequirements: event.noCockRequirements,
          prize: event.prize
        },
        standings,
        prizeDistribution,
        totalMatches,
        completedMatches,
        remainingMatches: totalMatches - completedMatches
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch derby championship standings', error: error.message });
  }
};

// Update prize amount for a specific match result
export const updateMatchResultPrizeAmount = async (req, res) => {
  try {
    const { id } = req.params;
    const { prizeAmount } = req.body;

    // Validate prize amount
    if (prizeAmount !== undefined && (prizeAmount < 0 || isNaN(prizeAmount))) {
      return res.status(400).json({
        success: false,
        message: 'Prize amount must be a non-negative number'
      });
    }

    const matchResult = await MatchResult.findById(id);
    if (!matchResult) {
      return res.status(404).json({
        success: false,
        message: 'Match result not found'
      });
    }

    // Update prize amount
    matchResult.prizeAmount = prizeAmount || 0;
    await matchResult.save();

    res.status(200).json({
      success: true,
      message: 'Prize amount updated successfully',
      data: {
        matchResultId: matchResult._id,
        prizeAmount: matchResult.prizeAmount
      }
    });
  } catch (error) {
    console.error('Error updating prize amount:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update prize distribution for fastest kill events
export const updateFastestKillPrizeDistribution = async (req, res) => {
  try {
    const { eventID } = req.params;
    const { prizeDistribution } = req.body;

    // Validate event exists and is fastest kill type
    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.eventType !== 'fastest_kill') {
      return res.status(400).json({
        success: false,
        message: 'Prize distribution can only be updated for fastest kill events'
      });
    }

    // Validate prize distribution doesn't exceed prize pool
    const totalDistributed = prizeDistribution.reduce((sum, item) => sum + (item.prizeAmount || 0), 0);
    if (totalDistributed > event.prize) {
      return res.status(400).json({
        success: false,
        message: `Total prize distribution (${totalDistributed}) exceeds prize pool (${event.prize})`
      });
    }

    // Update prize amounts for each match result
    const updatePromises = prizeDistribution.map(async (item) => {
      return await MatchResult.findByIdAndUpdate(
        item.resultId,
        { prizeAmount: item.prizeAmount },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Prize distribution updated successfully',
      data: {
        eventId: event._id,
        totalDistributed,
        remainingPrize: event.prize - totalDistributed
      }
    });
  } catch (error) {
    console.error('Error updating prize distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
