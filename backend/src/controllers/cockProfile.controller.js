import CockProfile from '../models/cockProfile.model.js';
import Event from '../models/event.model.js';

// Create new cock profile
export const createCockProfile = async (req, res) => {
  try {
    const { eventID, participantID, legband, weight } = req.body;

    // Get event details to check event type
    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is active
    if (event.status !== 'active') {
      return res.status(400).json({ message: 'Event is not active for registration' });
    }

    // Check registration deadline for derby events
    if (event.eventType === 'derby' && event.registrationDeadline) {
      const currentTime = new Date();
      const deadline = new Date(event.registrationDeadline);

      if (currentTime > deadline) {
        return res.status(400).json({
          message: `Registration deadline has passed. Registration closed on ${deadline.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}`
        });
      }
    }

    // Enforce per-participant cock limit for derby events
    if (event.eventType === 'derby' && typeof event.noCockRequirements === 'number' && event.noCockRequirements > 0) {
      const currentCount = await CockProfile.countDocuments({ eventID, participantID });
      if (currentCount >= event.noCockRequirements) {
        return res.status(400).json({
          message: `Limit reached: Participant may register up to ${event.noCockRequirements} cocks for this event`
        });
      }
    }

    // Auto-generate entry number for this event
    const lastCockProfile = await CockProfile.findOne({ eventID }).sort({ entryNo: -1 });
    const nextEntryNo = lastCockProfile ? lastCockProfile.entryNo + 1 : 1;


    // For derby events, validate legband and weight
    if (event.eventType === 'derby') {
      if (!legband) {
        return res.status(400).json({ message: 'Legband is required for derby events' });
      }
      if (!weight) {
        return res.status(400).json({ message: 'Weight is required for derby events' });
      }

      // Check if legband already exists for this event (only for derby events)
      const existingLegband = await CockProfile.findOne({ eventID, legband });
      if (existingLegband) {
        return res.status(400).json({ message: 'Cock with this legband already exists for this event' });
      }
    }


    const cockProfileData = {
      eventID,
      participantID,
      entryNo: nextEntryNo
    };

    // Only add legband and weight for derby events
    if (event.eventType === 'derby') {
      cockProfileData.legband = legband;
      cockProfileData.weight = parseFloat(weight);
    }


    const cockProfile = new CockProfile(cockProfileData);

    await cockProfile.save();

    // Populate references for response
    await cockProfile.populate([
      { path: 'eventID', select: 'eventName date location eventType' },
      { path: 'participantID', select: 'participantName contactNumber address' }
    ]);

    res.status(201).json({ message: 'Cock profile created successfully', data: cockProfile });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create cock profile', error: error.message });
  }
};

// Create multiple cock profiles in bulk
export const createBulkCockProfiles = async (req, res) => {
  try {
    const { eventID, participantID, cockProfiles } = req.body;

    if (!eventID || !participantID || !cockProfiles || !Array.isArray(cockProfiles) || cockProfiles.length === 0) {
      return res.status(400).json({ message: 'Event ID, participant ID, and at least one cock profile are required' });
    }

    // Get event details to check event type
    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is active
    if (event.status !== 'active') {
      return res.status(400).json({ message: 'Event is not active for registration' });
    }

    // Check registration deadline for derby events
    if (event.eventType === 'derby' && event.registrationDeadline) {
      const currentTime = new Date();
      const deadline = new Date(event.registrationDeadline);

      if (currentTime > deadline) {
        return res.status(400).json({
          message: `Registration deadline has passed. Registration closed on ${deadline.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}`
        });
      }
    }

    // Enforce per-participant cock limit for derby events
    if (event.eventType === 'derby' && typeof event.noCockRequirements === 'number' && event.noCockRequirements > 0) {
      const currentCount = await CockProfile.countDocuments({ eventID, participantID });
      const newTotal = currentCount + cockProfiles.length;
      if (newTotal > event.noCockRequirements) {
        return res.status(400).json({
          message: `Limit exceeded: Participant may register up to ${event.noCockRequirements} cocks for this event. Currently registered: ${currentCount}, attempting to add: ${cockProfiles.length}`
        });
      }
    }

    // Get the last entry number for this event
    const lastCockProfile = await CockProfile.findOne({ eventID }).sort({ entryNo: -1 });
    let nextEntryNo = lastCockProfile ? lastCockProfile.entryNo + 1 : 1;

    // Validate and prepare cock profiles
    const profilesToCreate = [];
    const legbands = new Set();

    for (let i = 0; i < cockProfiles.length; i++) {
      const profile = cockProfiles[i];

      // For derby events, validate legband and weight
      if (event.eventType === 'derby') {
        if (!profile.legband) {
          return res.status(400).json({ message: `Legband is required for cock profile ${i + 1}` });
        }
        if (!profile.weight) {
          return res.status(400).json({ message: `Weight is required for cock profile ${i + 1}` });
        }

        // Check for duplicate legbands in the request
        if (legbands.has(profile.legband)) {
          return res.status(400).json({ message: `Duplicate legband "${profile.legband}" found in the request` });
        }
        legbands.add(profile.legband);

        // Check if legband already exists for this event
        const existingLegband = await CockProfile.findOne({ eventID, legband: profile.legband });
        if (existingLegband) {
          return res.status(400).json({ message: `Cock with legband "${profile.legband}" already exists for this event` });
        }
      }

      const cockProfileData = {
        eventID,
        participantID,
        entryNo: nextEntryNo + i
      };

      // Only add legband and weight for derby events
      if (event.eventType === 'derby') {
        cockProfileData.legband = profile.legband;
        cockProfileData.weight = parseFloat(profile.weight);
      }

      profilesToCreate.push(cockProfileData);
    }

    // Create all cock profiles
    const createdProfiles = await CockProfile.insertMany(profilesToCreate);

    // Populate references for response
    await CockProfile.populate(createdProfiles, [
      { path: 'eventID', select: 'eventName date location eventType' },
      { path: 'participantID', select: 'participantName contactNumber address' }
    ]);

    res.status(201).json({
      message: `Successfully created ${createdProfiles.length} cock profile(s)`,
      data: createdProfiles
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create cock profiles', error: error.message });
  }
};

// Get all cock profiles (with filtering)
export const getAllCockProfiles = async (req, res) => {
  try {
    const { eventID, participantID, isActive, status, search } = req.query;

    let query = {};

    // Filter by event
    if (eventID) {
      query.eventID = eventID;
    }

    // Filter by participant
    if (participantID) {
      query.participantID = participantID;
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search functionality
    if (search) {
      const searchNum = parseInt(search);
      if (!isNaN(searchNum)) {
        // If search is a number, search by entryNo
        query.$or = [
          { entryNo: searchNum },
          { legband: { $regex: search, $options: 'i' } }
        ];
      } else {
        // If search is not a number, only search by legband
        query.$or = [
          { legband: { $regex: search, $options: 'i' } }
        ];
      }
    }

    const cockProfiles = await CockProfile.find(query)
      .populate('eventID', 'eventName date location eventType')
      .populate('participantID', 'participantName contactNumber address')
      .sort({ createdAt: -1 });

    res.json({
      data: cockProfiles
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cock profiles', error: error.message });
  }
};

// Get cock profile by ID
export const getCockProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const cockProfile = await CockProfile.findById(id)
      .populate('eventID', 'eventName date location eventType')
      .populate('participantID', 'participantName contactNumber address');

    if (!cockProfile) {
      return res.status(404).json({ message: 'Cock profile not found' });
    }

    res.json({ data: cockProfile });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cock profile', error: error.message });
  }
};

// Update cock profile
export const updateCockProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventID, participantID, legband, weight, isActive } = req.body;

    const cockProfile = await CockProfile.findById(id);
    if (!cockProfile) {
      return res.status(404).json({ message: 'Cock profile not found' });
    }

    // Get event details to check event type
    const event = await Event.findById(eventID || cockProfile.eventID);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Enforce per-participant cock limit for derby events (when changing participant or event)
    const targetEventId = eventID || cockProfile.eventID;
    const targetParticipantId = participantID || cockProfile.participantID;
    if (event.eventType === 'derby' && typeof event.noCockRequirements === 'number' && event.noCockRequirements > 0) {
      const currentCount = await CockProfile.countDocuments({
        eventID: targetEventId,
        participantID: targetParticipantId,
        _id: { $ne: id }
      });
      if (currentCount >= event.noCockRequirements) {
        return res.status(400).json({
          message: `Limit reached: Participant may register up to ${event.noCockRequirements} cocks for this event`
        });
      }
    }

    // For derby events, validate legband and weight
    if (event.eventType === 'derby') {
      if (!legband) {
        return res.status(400).json({ message: 'Legband is required for derby events' });
      }
      if (!weight) {
        return res.status(400).json({ message: 'Weight is required for derby events' });
      }

      // Check if legband is being changed and if it already exists for this event
      if (legband && legband !== cockProfile.legband) {
        const existingLegband = await CockProfile.findOne({
          eventID: eventID || cockProfile.eventID,
          legband,
          _id: { $ne: id }
        });
        if (existingLegband) {
          return res.status(400).json({ message: 'Cock with this legband already exists for this event' });
        }
      }
    }

    const updateData = { eventID, participantID, isActive };

    // Only include legband and weight for derby events
    if (event.eventType === 'derby') {
      updateData.legband = legband;
      updateData.weight = parseFloat(weight);
    } else {
      // For regular events, remove legband and weight if they exist
      updateData.legband = undefined;
      updateData.weight = undefined;
    }

    const updatedCockProfile = await CockProfile.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'eventID', select: 'eventName date location eventType' },
      { path: 'participantID', select: 'participantName contactNumber address' }
    ]);

    res.json({ message: 'Cock profile updated successfully', data: updatedCockProfile });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update cock profile', error: error.message });
  }
};

// Delete cock profile
export const deleteCockProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const cockProfile = await CockProfile.findByIdAndDelete(id);

    if (!cockProfile) {
      return res.status(404).json({ message: 'Cock profile not found' });
    }

    res.json({ message: 'Cock profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete cock profile', error: error.message });
  }
};

// Get cock profiles by event
export const getCockProfilesByEvent = async (req, res) => {
  try {
    const { eventID } = req.params;
    const { isActive, status } = req.query;

    let query = { eventID };

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (status) {
      query.status = status;
    }

    const cockProfiles = await CockProfile.find(query)
      .populate('eventID', 'eventName date location eventType')
      .populate('participantID', 'participantName contactNumber address')
      .sort({ createdAt: -1 });

    res.json({
      data: cockProfiles
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cock profiles by event', error: error.message });
  }
};

// Get cock profiles by participant
export const getCockProfilesByParticipant = async (req, res) => {
  try {
    const { participantID } = req.params;
    const { eventID, isActive, status } = req.query;

    let query = { participantID };

    if (eventID) {
      query.eventID = eventID;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (status) {
      query.status = status;
    }

    const cockProfiles = await CockProfile.find(query)
      .populate('eventID', 'eventName date location eventType')
      .populate('participantID', 'participantName contactNumber address')
      .sort({ createdAt: -1 });

    res.json({ data: cockProfiles });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cock profiles', error: error.message });
  }
};
