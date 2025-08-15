import MatchResult from '../models/matchResult.model.js';
import FightSchedule from '../models/fightSchedule.model.js';
import Participant from '../models/participant.model.js';
import CockProfile from '../models/cockProfile.model.js';

// Create a match result
export const createMatchResult = async (req, res) => {
  try {
    const {
      matchID,
      winnerParticipantID,
      loserParticipantID,
      winnerCockProfileID,
      loserCockProfileID,
      matchStartTime,
      matchEndTime,
      matchType,
      description,
      notes
    } = req.body;
    const recordedBy = req.user.id;

    // Validate fight schedule exists
    const fightSchedule = await FightSchedule.findById(matchID)
      .populate('participantsID', 'participantName')
      .populate('position');

    if (!fightSchedule) {
      return res.status(404).json({ message: 'Fight schedule not found' });
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

    // Validate participants are part of this fight
    const participantIDs = fightSchedule.participantsID.map(p => p._id.toString());
    if (!participantIDs.includes(winnerParticipantID) || !participantIDs.includes(loserParticipantID)) {
      return res.status(400).json({ message: 'Participants must be part of this fight' });
    }

    // Validate cock profiles
    const cockProfileIDs = fightSchedule.cockProfileID.map(c => c.toString());
    if (!cockProfileIDs.includes(winnerCockProfileID) || !cockProfileIDs.includes(loserCockProfileID)) {
      return res.status(400).json({ message: 'Cock profiles must be part of this fight' });
    }

    // Create match result
    const matchResult = new MatchResult({
      matchID,
      totalBet: fightSchedule.totalBet,
      prize: {
        plazadaFee: fightSchedule.plazadaFee // Use actual plazada fee from fight schedule
      },
      resultMatch: {
        winnerParticipantID,
        loserParticipantID,
        winnerCockProfileID,
        loserCockProfileID,
        matchType,
        description
      },
      matchStartTime,
      matchEndTime,
      recordedBy,
      notes
    });

    // Determine bet winner based on participant position
    matchResult.determineBetWinner(fightSchedule);

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

    // Deactivate the cock profiles that participated in this fight
    try {
      await CockProfile.updateMany(
        {
          _id: {
            $in: [winnerCockProfileID, loserCockProfileID]
          }
        },
        { isActive: false }
      );
    } catch (error) {
      console.error('Error deactivating cock profiles:', error);
    }

    // Populate references for response
    await matchResult.populate([
      { path: 'matchID', select: 'fightNumber eventID' },
      { path: 'resultMatch.winnerParticipantID', select: 'participantName contactNumber' },
      { path: 'resultMatch.loserParticipantID', select: 'participantName contactNumber' },
      { path: 'resultMatch.winnerCockProfileID', select: 'legband weight ownerName' },
      { path: 'resultMatch.loserCockProfileID', select: 'legband weight ownerName' },
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
    const { page = 1, limit = 10, betWinner, matchType, verified } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by bet winner
    if (betWinner) {
      query.betWinner = betWinner;
    }

    // Filter by match type
    if (matchType) {
      query['resultMatch.matchType'] = matchType;
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
      .populate('resultMatch.winnerParticipantID', 'participantName')
      .populate('resultMatch.loserParticipantID', 'participantName')
      .populate('resultMatch.winnerCockProfileID', 'legband ownerName')
      .populate('resultMatch.loserCockProfileID', 'legband ownerName')
      .populate('recordedBy', 'username')
      .populate('verifiedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MatchResult.countDocuments(query);

    res.json({
      data: matchResults,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalRecords: total
      }
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
        select: 'fightNumber eventID participantsID cockProfileID position',
        populate: [
          { path: 'eventID', select: 'eventName date location' },
          { path: 'participantsID', select: 'participantName contactNumber' },
          { path: 'cockProfileID', select: 'legband weight ownerName' }
        ]
      })
      .populate('resultMatch.winnerParticipantID', 'participantName contactNumber email')
      .populate('resultMatch.loserParticipantID', 'participantName contactNumber email')
      .populate('resultMatch.winnerCockProfileID', 'legband weight ownerName entryNo')
      .populate('resultMatch.loserCockProfileID', 'legband weight ownerName entryNo')
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
      winnerParticipantID,
      loserParticipantID,
      winnerCockProfileID,
      loserCockProfileID,
      matchStartTime,
      matchEndTime,
      matchType,
      description,
      notes,
      status
    } = req.body;

    const matchResult = await MatchResult.findById(id);
    if (!matchResult) {
      return res.status(404).json({ message: 'Match result not found' });
    }

    // Check if result is already verified and final
    if (matchResult.verified && matchResult.status === 'final') {
      return res.status(400).json({ message: 'Cannot update verified and final match result' });
    }

    // Update result match fields
    if (winnerParticipantID) matchResult.resultMatch.winnerParticipantID = winnerParticipantID;
    if (loserParticipantID) matchResult.resultMatch.loserParticipantID = loserParticipantID;
    if (winnerCockProfileID) matchResult.resultMatch.winnerCockProfileID = winnerCockProfileID;
    if (loserCockProfileID) matchResult.resultMatch.loserCockProfileID = loserCockProfileID;
    if (matchType) matchResult.resultMatch.matchType = matchType;
    if (description !== undefined) matchResult.resultMatch.description = description;

    // Update timing
    if (matchStartTime) matchResult.matchStartTime = matchStartTime;
    if (matchEndTime) matchResult.matchEndTime = matchEndTime;

    // Update other fields
    if (notes !== undefined) matchResult.notes = notes;
    if (status) matchResult.status = status;

    // Recalculate bet winner if participants changed
    if (winnerParticipantID) {
      const fightSchedule = await FightSchedule.findById(matchResult.matchID);
      if (fightSchedule) {
        matchResult.determineBetWinner(fightSchedule);
      }
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
      { path: 'resultMatch.winnerParticipantID', select: 'participantName contactNumber' },
      { path: 'resultMatch.loserParticipantID', select: 'participantName contactNumber' },
      { path: 'resultMatch.winnerCockProfileID', select: 'legband weight ownerName' },
      { path: 'resultMatch.loserCockProfileID', select: 'legband weight ownerName' },
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

    // Check if result is verified and final
    if (matchResult.verified && matchResult.status === 'final') {
      return res.status(400).json({ message: 'Cannot delete verified and final match result' });
    }

    // Update fight schedule status back to scheduled (ready for a new result)
    await FightSchedule.findByIdAndUpdate(matchResult.matchID, {
      status: 'scheduled'
    }, {
      new: true,
      runValidators: true
    });

    // Reactivate the cock profiles since the result is being deleted
    try {
      await CockProfile.updateMany(
        {
          _id: {
            $in: [matchResult.resultMatch.winnerCockProfileID, matchResult.resultMatch.loserCockProfileID]
          }
        },
        { isActive: true }
      );
    } catch (error) {
      console.error('Error reactivating cock profiles:', error);
    }

    await MatchResult.findByIdAndDelete(id);
    res.json({ message: 'Match result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete match result', error: error.message });
  }
};

// Update match result status only
export const updateMatchResultStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status value
    const validStatuses = ['pending', 'confirmed', 'disputed', 'final'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const matchResult = await MatchResult.findById(id);
    if (!matchResult) {
      return res.status(404).json({ message: 'Match result not found' });
    }

    // Check if result is already verified and final
    if (matchResult.verified && matchResult.status === 'final') {
      return res.status(400).json({ message: 'Cannot update verified and final match result' });
    }

    // Update only the status
    matchResult.status = status;
    await matchResult.save();

    res.json({
      message: 'Match result status updated successfully',
      data: { _id: matchResult._id, status: matchResult.status }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update match result status', error: error.message });
  }
};

// Verify match result
export const verifyMatchResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified, notes } = req.body;
    const verifiedBy = req.user.id;

    const matchResult = await MatchResult.findById(id);
    if (!matchResult) {
      return res.status(404).json({ message: 'Match result not found' });
    }

    matchResult.verified = verified;
    matchResult.verifiedBy = verified ? verifiedBy : null;
    matchResult.verifiedAt = verified ? new Date() : null;
    matchResult.status = verified ? 'final' : 'pending';

    if (notes !== undefined) {
      matchResult.notes = notes;
    }

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
      .populate('resultMatch.winnerParticipantID', 'participantName')
      .populate('resultMatch.loserParticipantID', 'participantName')
      .populate('resultMatch.winnerCockProfileID', 'legband ownerName')
      .populate('resultMatch.loserCockProfileID', 'legband ownerName')
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
          totalBets: { $sum: '$totalBet' },
          totalPrizes: { $sum: '$prize.totalPrizePool' },
          meronWins: {
            $sum: { $cond: [{ $eq: ['$betWinner', 'Meron'] }, 1, 0] }
          },
          walaWins: {
            $sum: { $cond: [{ $eq: ['$betWinner', 'Wala'] }, 1, 0] }
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
      totalBets: 0,
      totalPrizes: 0,
      meronWins: 0,
      walaWins: 0,
      verifiedMatches: 0,
      avgMatchDuration: 0
    };

    res.json({ data: statistics });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch match statistics', error: error.message });
  }
};
