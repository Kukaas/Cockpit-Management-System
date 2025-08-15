import Entrance from '../models/entrance.model.js';
import Event from '../models/event.model.js';

// Record entrance fee
export const recordEntrance = async (req, res) => {
  try {
    const {
      eventID,
      personName,
      contactNumber,
      email,
      address,
      entranceFee,
      date,
      notes
    } = req.body;
    const recordedBy = req.user._id;

    // Validate required fields
    if (!eventID || !personName || !contactNumber || !email || !address || entranceFee === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Event ID, person information, and entrance fee are required'
      });
    }

    // Validate event exists and is active
    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Event is not active'
      });
    }

    // Validate entrance fee matches event entrance fee
    if (entranceFee !== event.entryFee) {
      return res.status(400).json({
        success: false,
        message: `Entrance fee must be ${event.entryFee} (event entrance fee)`
      });
    }

    // Create entrance record
    const entrance = new Entrance({
      eventID,
      personName,
      contactNumber,
      email,
      address,
      entranceFee,
      date: date ? new Date(date) : new Date(),
      recordedBy,
      notes
    });

    await entrance.save();

    // Populate references for response
    await entrance.populate([
      { path: 'eventID', select: 'eventName date location entryFee' },
      { path: 'recordedBy', select: 'username firstName lastName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Entrance fee recorded successfully',
      data: entrance
    });
  } catch (error) {
    console.error('Error recording entrance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record entrance fee',
      error: error.message
    });
  }
};

// Get all entrance records (with filtering)
export const getAllEntrances = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      eventID,
      status,
      dateFrom,
      dateTo,
      search
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    let query = {};

    // Filter by event
    if (eventID) {
      query.eventID = eventID;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    // Search functionality
    if (search) {
      query.$or = [
        { personName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const entrances = await Entrance.find(query)
      .populate('eventID', 'eventName date location entryFee')
      .populate('recordedBy', 'username firstName lastName')
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Entrance.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Entrance records retrieved successfully',
      data: entrances,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Error getting entrances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entrance records',
      error: error.message
    });
  }
};

// Get entrance by ID
export const getEntranceById = async (req, res) => {
  try {
    const { id } = req.params;

    const entrance = await Entrance.findById(id)
      .populate('eventID', 'eventName date location entryFee')
      .populate('recordedBy', 'username firstName lastName');

    if (!entrance) {
      return res.status(404).json({
        success: false,
        message: 'Entrance record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Entrance record retrieved successfully',
      data: entrance
    });
  } catch (error) {
    console.error('Error getting entrance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entrance record',
      error: error.message
    });
  }
};

// Update entrance record
export const updateEntrance = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      personName,
      contactNumber,
      email,
      address,
      entranceFee,
      date,
      notes,
      status
    } = req.body;

    const entrance = await Entrance.findById(id);
    if (!entrance) {
      return res.status(404).json({
        success: false,
        message: 'Entrance record not found'
      });
    }

    // If entrance fee is being updated, validate it matches the event requirement
    if (entranceFee !== undefined) {
      const event = await Event.findById(entrance.eventID);
      if (event && entranceFee !== event.entryFee) {
        return res.status(400).json({
          success: false,
          message: `Entrance fee must be ${event.entryFee} (event entrance fee)`
        });
      }
    }

    const updatedEntrance = await Entrance.findByIdAndUpdate(
      id,
      {
        personName,
        contactNumber,
        email,
        address,
        entranceFee,
        date: date ? new Date(date) : undefined,
        notes,
        status
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'eventID', select: 'eventName date location entryFee' },
      { path: 'recordedBy', select: 'username firstName lastName' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Entrance record updated successfully',
      data: updatedEntrance
    });
  } catch (error) {
    console.error('Error updating entrance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update entrance record',
      error: error.message
    });
  }
};

// Delete entrance record
export const deleteEntrance = async (req, res) => {
  try {
    const { id } = req.params;

    const entrance = await Entrance.findById(id);
    if (!entrance) {
      return res.status(404).json({
        success: false,
        message: 'Entrance record not found'
      });
    }

    await Entrance.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Entrance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting entrance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete entrance record',
      error: error.message
    });
  }
};

// Get entrances by event
export const getEntrancesByEvent = async (req, res) => {
  try {
    const { eventID } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    let query = { eventID };

    if (status) {
      query.status = status;
    }

    const entrances = await Entrance.find(query)
      .populate('eventID', 'eventName date location entryFee')
      .populate('recordedBy', 'username firstName lastName')
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Entrance.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Event entrance records retrieved successfully',
      data: entrances,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Error getting entrances by event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event entrance records',
      error: error.message
    });
  }
};

// Get entrances by person name
export const getEntrancesByName = async (req, res) => {
  try {
    const { personName } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    let query = { personName };

    if (status) {
      query.status = status;
    }

    const entrances = await Entrance.find(query)
      .populate('eventID', 'eventName date location entryFee')
      .populate('recordedBy', 'username firstName lastName')
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Entrance.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Person entrance records retrieved successfully',
      data: entrances,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Error getting entrances by name:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch person entrance records',
      error: error.message
    });
  }
};

// Get entrance statistics for an event
export const getEntranceStats = async (req, res) => {
  try {
    const { eventID } = req.params;

    // Validate event exists
    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get entrance statistics
    const stats = await Entrance.aggregate([
      { $match: { eventID: event._id } },
      {
        $group: {
          _id: null,
          totalEntrances: { $sum: 1 },
          totalRevenue: { $sum: '$entranceFee' },
          averageFee: { $avg: '$entranceFee' }
        }
      }
    ]);

    // Get daily breakdown
    const dailyStats = await Entrance.aggregate([
      { $match: { eventID: event._id } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$entranceFee' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const result = {
      event: {
        _id: event._id,
        eventName: event.eventName,
        entryFee: event.entryFee
      },
      summary: stats[0] || {
        totalEntrances: 0,
        totalRevenue: 0,
        averageFee: 0
      },
      dailyBreakdown: dailyStats
    };

    res.status(200).json({
      success: true,
      message: 'Entrance statistics retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting entrance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entrance statistics',
      error: error.message
    });
  }
};
