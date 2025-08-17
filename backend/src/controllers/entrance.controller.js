import Entrance from '../models/entrance.model.js';
import Event from '../models/event.model.js';

// Record entrance tally
export const recordEntrance = async (req, res) => {
  try {
    const {
      eventID,
      count
    } = req.body;
    const recordedBy = req.user._id;

    // Validate required fields
    if (!eventID || count === undefined || count < 1) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and count (minimum 1) are required'
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

    // Create entrance record
    const entrance = new Entrance({
      eventID,
      count: Number(count),
      date: new Date(),
      recordedBy
    });

    await entrance.save();

    // Populate references for response
    await entrance.populate([
      { path: 'eventID', select: 'eventName date location maxCapacity' },
      { path: 'recordedBy', select: 'username firstName lastName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Entrance tally recorded successfully',
      data: entrance
    });
  } catch (error) {
    console.error('Error recording entrance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record entrance tally',
      error: error.message
    });
  }
};

// Get all entrance records (with filtering)
export const getAllEntrances = async (req, res) => {
  try {
    const {
      page,
      limit,
      eventID,
      dateFrom,
      dateTo
    } = req.query;

    let query = {};

    // Filter by event
    if (eventID) {
      query.eventID = eventID;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    // If pagination parameters are provided, use them; otherwise get all records
    let entrances;
    let pagination = null;

    if (page && limit) {
      const skip = (Number(page) - 1) * Number(limit);
      entrances = await Entrance.find(query)
        .populate('eventID', 'eventName date location maxCapacity')
        .populate('recordedBy', 'username firstName lastName')
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Entrance.countDocuments(query);
      pagination = {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      };
    } else {
      // Get all records without pagination
      entrances = await Entrance.find(query)
        .populate('eventID', 'eventName date location maxCapacity')
        .populate('recordedBy', 'username firstName lastName')
        .sort({ date: -1 });
    }

    res.status(200).json({
      success: true,
      message: 'Entrance records retrieved successfully',
      data: entrances,
      ...(pagination && { pagination })
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
      .populate('eventID', 'eventName date location maxCapacity')
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
    const { count } = req.body;

    const entrance = await Entrance.findById(id);
    if (!entrance) {
      return res.status(404).json({
        success: false,
        message: 'Entrance record not found'
      });
    }

    // Validate count
    if (count !== undefined && (count < 1 || !Number.isInteger(Number(count)))) {
      return res.status(400).json({
        success: false,
        message: 'Count must be a positive integer'
      });
    }

    const updatedEntrance = await Entrance.findByIdAndUpdate(
      id,
      {
        count: count !== undefined ? Number(count) : undefined
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'eventID', select: 'eventName date location maxCapacity' },
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
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const entrances = await Entrance.find({ eventID })
      .populate('eventID', 'eventName date location maxCapacity')
      .populate('recordedBy', 'username firstName lastName')
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Entrance.countDocuments({ eventID });

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
          totalTallyRecords: { $sum: 1 },
          totalEntrances: { $sum: '$count' },
          totalRevenue: { $sum: { $multiply: ['$count', 100] } } // Assuming 100 pesos per entrance
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
          tallyRecords: { $sum: 1 },
          entrances: { $sum: '$count' },
          revenue: { $sum: { $multiply: ['$count', 100] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const result = {
      event: {
        _id: event._id,
        eventName: event.eventName,
        maxCapacity: event.maxCapacity
      },
      summary: stats[0] || {
        totalTallyRecords: 0,
        totalEntrances: 0,
        totalRevenue: 0
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
