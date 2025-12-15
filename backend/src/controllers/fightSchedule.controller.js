import FightSchedule from '../models/fightSchedule.model.js';
import Participant from '../models/participant.model.js';
import CockProfile from '../models/cockProfile.model.js';
import Event from '../models/event.model.js';

// Create a new fight schedule
export const createFightSchedule = async (req, res) => {
  try {
    const {
      eventID,
      participantsID,
      cockProfileID
    } = req.body;
    const scheduledBy = req.user.id;

    // Validate event exists
    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Validate participants
    if (!participantsID || participantsID.length !== 2) {
      return res.status(400).json({ message: 'Exactly 2 participants are required for a fight' });
    }

    const participants = await Participant.find({ _id: { $in: participantsID } });
    if (participants.length !== 2) {
      return res.status(404).json({ message: 'One or more participants not found' });
    }

    // Validate that participants are different (prevent same participant from fighting themselves)
    if (participants[0].participantName === participants[1].participantName) {
      return res.status(400).json({ message: 'Cannot schedule a fight with the same participant' });
    }

    // Validate cock profiles
    if (!cockProfileID || cockProfileID.length !== 2) {
      return res.status(400).json({ message: 'Exactly 2 cock profiles are required for a fight' });
    }

    const cockProfiles = await CockProfile.find({ _id: { $in: cockProfileID } });
    if (cockProfiles.length !== 2) {
      return res.status(404).json({ message: 'One or more cock profiles not found' });
    }

    // Get next fight number for this event
    const lastFight = await FightSchedule.findOne({ eventID }).sort({ fightNumber: -1 });
    const fightNumber = lastFight ? lastFight.fightNumber + 1 : 1;

    // Create fight schedule
    const fightSchedule = new FightSchedule({
      eventID,
      participantsID,
      cockProfileID,
      fightNumber,
      scheduledBy
    });

    await fightSchedule.save();

    // Update cock profiles status to 'scheduled'
    await CockProfile.updateMany(
      { _id: { $in: cockProfileID } },
      { status: 'scheduled' }
    );

    // Populate references for response
    await fightSchedule.populate([
      { path: 'eventID', select: 'eventName date location' },
      { path: 'participantsID', select: 'participantName contactNumber' },
      { path: 'cockProfileID', select: 'legband weight entryNo ownerName' },
      { path: 'scheduledBy', select: 'username' }
    ]);

    res.status(201).json({
      message: 'Fight scheduled successfully',
      data: fightSchedule
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create fight schedule', error: error.message });
  }
};

// Auto-schedule fights for an event based on weight matching
export const autoScheduleFights = async (req, res) => {
  try {
    const { eventID } = req.params;
    const scheduledBy = req.user.id;

    // Validate event exists
    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Validate weight configuration for derby events only
    if (event.eventType === 'derby' && (!event.minWeight || !event.maxWeight)) {
      return res.status(400).json({ message: 'Derby events must have minWeight and maxWeight configured' });
    }

    // Get all available cock profiles for this event
    const availableCocks = await CockProfile.find({
      eventID,
      status: 'available',
      isActive: true
    }).populate('participantID', 'entryName participantName');

    if (availableCocks.length < 2) {
      return res.status(400).json({ message: 'Not enough available chickens to schedule fights (minimum 2 required)' });
    }

    // For derby events only, filter out cocks without entryName
    // For regular, fastest_kill, and hits_ulutan events, use all available cocks
    let cocksToSchedule = availableCocks;
    let cocksWithoutEntryName = [];

    if (event.eventType === 'derby') {
      const cocksWithEntryName = availableCocks.filter(cock => cock.participantID?.entryName);
      cocksWithoutEntryName = availableCocks.filter(cock => !cock.participantID?.entryName);

      if (cocksWithEntryName.length < 2) {
        return res.status(400).json({
          message: 'Not enough chickens with entry names to schedule fights',
          unmatchedCount: cocksWithoutEntryName.length
        });
      }

      cocksToSchedule = cocksWithEntryName;
    }

    const createdFights = [];
    const unmatched = [];

    // Step 1: Group by exact weight
    const weightGroups = {};
    cocksToSchedule.forEach(cock => {
      const weight = cock.weight;
      if (!weightGroups[weight]) {
        weightGroups[weight] = [];
      }
      weightGroups[weight].push(cock);
    });

    // Step 2: Match within exact weight groups
    for (const weight in weightGroups) {
      const cocks = weightGroups[weight];

      while (cocks.length >= 2) {
        const cock1 = cocks.shift();

        // Find opponent with different entryName and participantName
        // For derby: check both entryName and participantName
        // For regular/fastest_kill/hits_ulutan: only check participantName
        const opponentIndex = cocks.findIndex(c => {
          const sameParticipant = c.participantID.participantName !== cock1.participantID.participantName;

          if (event.eventType === 'derby') {
            return c.participantID.entryName !== cock1.participantID.entryName && sameParticipant;
          }

          return sameParticipant;
        });

        if (opponentIndex >= 0) {
          const cock2 = cocks.splice(opponentIndex, 1)[0];

          // Get next fight number
          const lastFight = await FightSchedule.findOne({ eventID }).sort({ fightNumber: -1 });
          const fightNumber = lastFight ? lastFight.fightNumber + createdFights.length + 1 : createdFights.length + 1;

          // Create fight
          const fight = new FightSchedule({
            eventID,
            participantsID: [cock1.participantID._id, cock2.participantID._id],
            cockProfileID: [cock1._id, cock2._id],
            fightNumber,
            scheduledBy
          });

          createdFights.push(fight);

          // Mark as matched
          cock1.matched = true;
          cock2.matched = true;
        } else {
          unmatched.push(cock1);
        }
      }

      // Add remaining single cock to unmatched
      if (cocks.length === 1) {
        unmatched.push(cocks[0]);
      }
    }

    // Step 3: Match remaining cocks within weight gap
    const remaining = unmatched.filter(c => !c.matched);
    remaining.sort((a, b) => a.weight - b.weight);

    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].matched) continue;

      const cock1 = remaining[i];
      let bestMatch = null;
      let minDiff = Infinity;

      // Find closest weight within gap
      for (let j = i + 1; j < remaining.length; j++) {
        if (remaining[j].matched) continue;

        const cock2 = remaining[j];
        const diff = Math.abs(cock1.weight - cock2.weight);

        // Check entry name and participant name conditionally based on event type
        let canMatch = false;

        if (event.eventType === 'derby') {
          // For derby: check both entryName and participantName
          canMatch = cock1.participantID.entryName !== cock2.participantID.entryName &&
            cock1.participantID.participantName !== cock2.participantID.participantName &&
            diff < minDiff;
        } else {
          // For regular/fastest_kill/hits_ulutan: only check participantName
          canMatch = cock1.participantID.participantName !== cock2.participantID.participantName &&
            diff < minDiff;
        }

        if (canMatch) {
          bestMatch = j;
          minDiff = diff;
        }
      }

      if (bestMatch !== null) {
        const cock2 = remaining[bestMatch];

        // Get next fight number
        const lastFight = await FightSchedule.findOne({ eventID }).sort({ fightNumber: -1 });
        const fightNumber = lastFight ? lastFight.fightNumber + createdFights.length + 1 : createdFights.length + 1;

        // Create fight
        const fight = new FightSchedule({
          eventID,
          participantsID: [cock1.participantID._id, cock2.participantID._id],
          cockProfileID: [cock1._id, cock2._id],
          fightNumber,
          scheduledBy
        });

        createdFights.push(fight);

        // Mark as matched
        remaining[i].matched = true;
        remaining[bestMatch].matched = true;
      }
    }

    // Save all created fights
    if (createdFights.length > 0) {
      const insertedFights = await FightSchedule.insertMany(createdFights);

      // Update cock profiles status to 'scheduled'
      const scheduledCockIDs = createdFights.flatMap(f => f.cockProfileID);
      await CockProfile.updateMany(
        { _id: { $in: scheduledCockIDs } },
        { status: 'scheduled' }
      );

      // Populate the inserted fights for response
      const populatedFights = await FightSchedule.find({
        _id: { $in: insertedFights.map(f => f._id) }
      })
        .populate('cockProfileID', 'entryNo weight legband')
        .populate('participantsID', 'participantName entryName');

      // Prepare unmatched list
      const unmatchedList = remaining
        .filter(c => !c.matched)
        .map(c => ({
          entryNo: c.entryNo,
          weight: c.weight,
          entryName: c.participantID.entryName,
          reason: 'No valid opponent found'
        }));

      // Add cocks without entry name to unmatched
      cocksWithoutEntryName.forEach(c => {
        unmatchedList.push({
          entryNo: c.entryNo,
          weight: c.weight,
          entryName: null,
          reason: 'Missing entry name'
        });
      });

      res.status(201).json({
        message: `Successfully scheduled ${createdFights.length} fights`,
        data: {
          created: createdFights.length,
          fights: populatedFights,
          unmatched: unmatchedList
        }
      });
    } else {
      // No fights created
      const unmatchedList = remaining
        .map(c => ({
          entryNo: c.entryNo,
          weight: c.weight,
          entryName: c.participantID?.entryName,
          reason: 'No valid opponent found'
        }));

      cocksWithoutEntryName.forEach(c => {
        unmatchedList.push({
          entryNo: c.entryNo,
          weight: c.weight,
          entryName: null,
          reason: 'Missing entry name'
        });
      });

      res.status(201).json({
        message: 'No fights could be scheduled',
        data: {
          created: 0,
          fights: [],
          unmatched: unmatchedList
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to auto-schedule fights', error: error.message });
  }
};

// Get all fight schedules (with filtering)
export const getAllFightSchedules = async (req, res) => {
  try {
    const { eventID, status, fightNumber } = req.query;

    let query = {};

    // Filter by event
    if (eventID) {
      query.eventID = eventID;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by fight number
    if (fightNumber) {
      query.fightNumber = parseInt(fightNumber);
    }

    const fightSchedules = await FightSchedule.find(query)
      .populate('eventID', 'eventName date location')
      .populate('participantsID', 'participantName contactNumber entryName')
      .populate('cockProfileID', 'legband weight entryNo ownerName')
      .populate('scheduledBy', 'username')
      .sort({ fightNumber: 1 });

    res.json({
      data: fightSchedules
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch fight schedules', error: error.message });
  }
};

// Get fight schedule by ID
export const getFightScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const fightSchedule = await FightSchedule.findById(id)
      .populate('eventID', 'eventName date location')
      .populate('participantsID', 'participantName contactNumber')
      .populate('cockProfileID', 'legband weight ownerName entryNo')
      .populate('scheduledBy', 'username');

    if (!fightSchedule) {
      return res.status(404).json({ message: 'Fight schedule not found' });
    }

    res.json({ data: fightSchedule });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch fight schedule', error: error.message });
  }
};

// Update fight schedule
export const updateFightSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status
    } = req.body;

    const fightSchedule = await FightSchedule.findById(id);
    if (!fightSchedule) {
      return res.status(404).json({ message: 'Fight schedule not found' });
    }

    // Check if fight is already in progress or completed
    if (fightSchedule.status === 'completed') {
      return res.status(400).json({ message: 'Cannot update completed fight' });
    }

    // Update fields
    if (status) fightSchedule.status = status;

    await fightSchedule.save();

    // Populate references for response
    await fightSchedule.populate([
      { path: 'eventID', select: 'eventName date location' },
      { path: 'participantsID', select: 'participantName contactNumber' },
      { path: 'cockProfileID', select: 'legband weight entryNo ownerName' },
      { path: 'scheduledBy', select: 'username' }
    ]);

    res.json({ message: 'Fight schedule updated successfully', data: fightSchedule });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update fight schedule', error: error.message });
  }
};

// Delete fight schedule
export const deleteFightSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const fightSchedule = await FightSchedule.findById(id);

    if (!fightSchedule) {
      return res.status(404).json({ message: 'Fight schedule not found' });
    }

    // Check if fight is already in progress or completed
    if (fightSchedule.status === 'in_progress' || fightSchedule.status === 'completed') {
      return res.status(400).json({ message: 'Cannot delete fight that is in progress or completed' });
    }

    // Reset cock profiles status back to 'available' when fight is deleted
    await CockProfile.updateMany(
      { _id: { $in: fightSchedule.cockProfileID } },
      { status: 'available' }
    );

    await FightSchedule.findByIdAndDelete(id);
    res.json({ message: 'Fight schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete fight schedule', error: error.message });
  }
};

// Get fight schedules by event
export const getFightSchedulesByEvent = async (req, res) => {
  try {
    const { eventID } = req.params;
    const { status } = req.query;

    let query = { eventID };

    if (status) {
      query.status = status;
    }

    const fightSchedules = await FightSchedule.find(query)
      .populate('participantsID', 'participantName contactNumber entryName')
      .populate('cockProfileID', 'legband weight entryNo ownerName')
      .populate('scheduledBy', 'username')
      .sort({ fightNumber: 1 });

    res.json({ data: fightSchedules });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch fight schedules for event', error: error.message });
  }
};

// Update fight status
export const updateFightStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const fightSchedule = await FightSchedule.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate([
      { path: 'eventID', select: 'eventName date location' },
      { path: 'participantsID', select: 'participantName contactNumber' },
      { path: 'cockProfileID', select: 'legband weight entryNo ownerName' }
    ]);

    if (!fightSchedule) {
      return res.status(404).json({ message: 'Fight schedule not found' });
    }

    res.json({ message: 'Fight status updated successfully', data: fightSchedule });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update fight status', error: error.message });
  }
};

// Get available participants for a fight (participants registered for the event)
export const getAvailableParticipants = async (req, res) => {
  try {
    const { eventID } = req.params;

    // Get all participants registered for this event (regardless of cock status)
    const allParticipants = await Participant.find({
      eventID,
      status: { $in: ['registered', 'confirmed'] }
    })
      .select('participantName contactNumber')
      .sort({ participantName: 1 });

    // Get participant IDs
    const participantIDs = allParticipants.map(p => p._id);

    // Get their available cock profiles (only cocks that are available for scheduling)
    const cockProfiles = await CockProfile.find({
      eventID,
      participantID: { $in: participantIDs },
      isActive: true,
      status: 'available'
    }).select('legband weight entryNo participantID status');

    // Add participantID to each cock profile (it's already there, but let's make sure it's included)
    const cockProfilesWithParticipantID = cockProfiles.map(cock => ({
      ...cock.toObject(),
      participantID: cock.participantID
    }));

    // Filter participants to only include those with at least one available cock
    const participantIDsWithAvailableCocks = new Set(
      cockProfiles.map(cock => cock.participantID.toString())
    );

    const participants = allParticipants.filter(participant =>
      participantIDsWithAvailableCocks.has(participant._id.toString())
    );

    res.json({
      participants,
      cockProfiles: cockProfilesWithParticipantID
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch available participants', error: error.message });
  }
};
