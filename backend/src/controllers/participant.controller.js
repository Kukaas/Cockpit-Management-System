import Participant from '../models/participant.model.js';
import Event from '../models/event.model.js';
import CockProfile from '../models/cockProfile.model.js';

// Register participant for event
export const registerParticipant = async (req, res) => {
  try {
    const {
      participantName,
      contactNumber,
      address,
      eventID,
      isExistingParticipant = false
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



    const participant = new Participant({
      participantName,
      contactNumber,
      address,
      eventID,
      registeredBy
    });

    await participant.save();

    // Populate references for response
    await participant.populate([
      { path: 'eventID', select: 'eventName date location noCockRequirements' },
      { path: 'registeredBy', select: 'username' }
    ]);


    res.status(201).json({
      message: 'Participant registered successfully',
      data: participant,
      isExistingParticipant
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to register participant', error: error.message });
  }
};

// Get all participants (with filtering)
export const getAllParticipants = async (req, res) => {
  try {
    const { eventID, status, search } = req.query;

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
        { participantName: { $regex: search, $options: 'i' } }
      ];
    }

    const participants = await Participant.find(query)
      .populate('eventID', 'eventName date location')
      .populate('registeredBy', 'username')
      .sort({ registrationDate: -1 });

    res.json({
      data: participants
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
      address
    } = req.body;

    const participant = await Participant.findById(id);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
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
        address
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'eventID', select: 'eventName date location noCockRequirements' },
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
      .populate('registeredBy', 'username')
      .sort({ registrationDate: -1 });

    res.json({ data: participants });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch participants', error: error.message });
  }
};
