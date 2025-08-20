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
      cockProfileID,
      scheduledTime
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
      scheduledTime: scheduledTime || new Date(),
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
      .populate('participantsID', 'participantName contactNumber')
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
      scheduledTime,
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
    if (scheduledTime) fightSchedule.scheduledTime = scheduledTime;
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
      .populate('participantsID', 'participantName contactNumber')
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
    const participants = await Participant.find({
      eventID,
      status: { $in: ['registered', 'confirmed'] }
    })
      .select('participantName contactNumber')
      .sort({ participantName: 1 });

    // Get participant IDs
    const participantIDs = participants.map(p => p._id);

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

    res.json({
      participants,
      cockProfiles: cockProfilesWithParticipantID
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch available participants', error: error.message });
  }
};
