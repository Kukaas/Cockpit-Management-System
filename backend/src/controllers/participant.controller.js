import Participant from '../models/participant.model.js';
import Event from '../models/event.model.js';
import CockProfile from '../models/cockProfile.model.js';
import { sendParticipantRegistrationEmail } from '../services/email.service.js';

// Register participant for event
export const registerParticipant = async (req, res) => {
  try {
    const {
      participantName,
      contactNumber,
      email,
      address,
      eventID,
      entryFee,
      matchWinRequirements,
      eventType,
      notes
    } = req.body;
    const registeredBy = req.user.id;

    // Validate event exists and is active
    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.status !== 'active') {
      return res.status(400).json({ message: 'Event is not active for registration' });
    }

    // Check if participant is already registered for this event
    const existingRegistration = await Participant.findOne({ eventID, participantName });
    if (existingRegistration) {
      return res.status(400).json({ message: 'Participant is already registered for this event' });
    }

    // Validate entry fee matches event requirement
    if (entryFee !== event.entryFee) {
      return res.status(400).json({ message: 'Entry fee does not match event requirement' });
    }

    const participant = new Participant({
      participantName,
      contactNumber,
      email,
      address,
      eventID,
      entryFee,
      matchWinRequirements,
      eventType,
      registeredBy,
      notes
    });

    await participant.save();

    // Populate references for response
    await participant.populate([
      { path: 'eventID', select: 'eventName date location' },
      { path: 'registeredBy', select: 'username' }
    ]);

    // Send registration confirmation email
    try {
      await sendParticipantRegistrationEmail(participant, event);
    } catch (emailError) {
      console.error('Failed to send registration email:', emailError);
      // Don't fail the registration if email fails, just log it
    }

    res.status(201).json({ message: 'Participant registered successfully', data: participant });
  } catch (error) {
    res.status(500).json({ message: 'Failed to register participant', error: error.message });
  }
};

// Get all participants (with filtering)
export const getAllParticipants = async (req, res) => {
  try {
    const { page = 1, limit = 10, eventID, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by event
    if (eventID) {
      query.eventID = eventID;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { participantName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const participants = await Participant.find(query)
      .populate('eventID', 'eventName date location')
      .populate('registeredBy', 'username')
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Participant.countDocuments(query);

    res.json({
      data: participants,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalRecords: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch participants', error: error.message });
  }
};

// Get participant by ID
export const getParticipantById = async (req, res) => {
  try {
    const { id } = req.params;
    const participant = await Participant.findById(id)
      .populate('eventID', 'eventName date location')
      .populate('registeredBy', 'username');

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    res.json({ data: participant });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch participant', error: error.message });
  }
};

// Update participant information
export const updateParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      participantName,
      contactNumber,
      email,
      address,
      entryFee,
      matchWinRequirements,
      eventType,
      notes
    } = req.body;

    const participant = await Participant.findById(id);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    // If entry fee is being updated, validate it matches the event requirement
    if (entryFee !== undefined) {
      const event = await Event.findById(participant.eventID);
      if (event && entryFee !== event.entryFee) {
        return res.status(400).json({ message: 'Entry fee does not match event requirement' });
      }
    }

        // Check if participant name is being changed and if it conflicts with existing registration
    if (participantName && participantName !== participant.participantName) {
      const existingRegistration = await Participant.findOne({
        eventID: participant.eventID,
        participantName,
        _id: { $ne: id }
      });
      if (existingRegistration) {
        return res.status(400).json({ message: 'Another participant with this name is already registered for this event' });
      }

      // Update all cock profiles with the old name to use the new name
      await CockProfile.updateMany(
        { ownerName: participant.participantName },
        { ownerName: participantName }
      );
    }

    const updatedParticipant = await Participant.findByIdAndUpdate(
      id,
      {
        participantName,
        contactNumber,
        email,
        address,
        entryFee,
        matchWinRequirements,
        eventType,
        notes
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'eventID', select: 'eventName date location' },
      { path: 'registeredBy', select: 'username' }
    ]);

    res.json({ message: 'Participant updated successfully', data: updatedParticipant });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update participant', error: error.message });
  }
};

// Update participant status
export const updateParticipantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const participant = await Participant.findById(id);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    const updatedParticipant = await Participant.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true, runValidators: true }
    ).populate([
      { path: 'eventID', select: 'eventName date location' },
      { path: 'registeredBy', select: 'username' }
    ]);

    res.json({ message: 'Participant status updated successfully', data: updatedParticipant });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update participant status', error: error.message });
  }
};

// Delete participant registration
export const deleteParticipant = async (req, res) => {
  try {
    const { id } = req.params;

    // First find the participant to get their name
    const participant = await Participant.findById(id);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Delete all cock profiles associated with this participant's name
    const deletedCockProfiles = await CockProfile.deleteMany({
      ownerName: participant.participantName
    });

    // Delete the participant
    await Participant.findByIdAndDelete(id);

    res.json({
      message: 'Participant registration deleted successfully',
      deletedCockProfiles: deletedCockProfiles.deletedCount,
      participantName: participant.participantName
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete participant', error: error.message });
  }
};

// Get participants by event
export const getParticipantsByEvent = async (req, res) => {
  try {
    const { eventID } = req.params;
    const { status } = req.query;

    let query = { eventID };

    if (status) {
      query.status = status;
    }

    const participants = await Participant.find(query)
      .populate('eventID', 'eventName date location')
      .populate('cockProfileID', 'legband entryNo weight')
      .populate('registeredBy', 'username')
      .sort({ registrationDate: -1 });

    res.json({ data: participants });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch participants', error: error.message });
  }
};

// Get participants by name
export const getParticipantsByName = async (req, res) => {
  try {
    const { participantName } = req.params;
    const { status } = req.query;

    let query = { participantName };

    if (status) {
      query.status = status;
    }

    const participants = await Participant.find(query)
      .populate('eventID', 'eventName date location')
      .populate('registeredBy', 'username')
      .sort({ registrationDate: -1 });

    res.json({ data: participants });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch participants', error: error.message });
  }
};
