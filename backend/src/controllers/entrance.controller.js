import Entrance from '../models/entrance.model.js';
import Event from '../models/event.model.js';
import mongoose from 'mongoose';

// Helper function to calculate current total entrances for an event
const getCurrentTotalEntrances = async (eventID) => {
  // Convert eventID to ObjectId if it's a string
  const eventObjectId = typeof eventID === 'string' ? new mongoose.Types.ObjectId(eventID) : eventID;

  const result = await Entrance.aggregate([
    { $match: { eventID: eventObjectId } },
    { $group: { _id: null, total: { $sum: '$count' } } }
  ]);
  return result.length > 0 ? result[0].total : 0;
};

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

    // Capacity limit check removed (maxCapacity field removed)

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
      { path: 'eventID', select: 'eventName date location entranceFee' },
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

    if (page) {
      entrances = await Entrance.find(query)
        .populate('eventID', 'eventName date location entranceFee')
        .populate('recordedBy', 'username firstName lastName')
        .sort({ date: -1 })

    } else {
      // Get all records without pagination
      entrances = await Entrance.find(query)
        .populate('eventID', 'eventName date location entranceFee')
        .populate('recordedBy', 'username firstName lastName')
        .sort({ date: -1 });
    }

    res.status(200).json({
      success: true,
      message: 'Entrance records retrieved successfully',
      data: entrances
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
      .populate('eventID', 'eventName date location entranceFee')
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

    // Check capacity limit if count is being updated
    if (count !== undefined) {
      const event = await Event.findById(entrance.eventID);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Associated event not found'
        });
      }

      // Capacity limit check removed (maxCapacity field removed)
    }

    const updatedEntrance = await Entrance.findByIdAndUpdate(
      id,
      {
        count: count !== undefined ? Number(count) : undefined
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'eventID', select: 'eventName date location entranceFee' },
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

    const entrances = await Entrance.find({ eventID })
      .populate('eventID', 'eventName date location entranceFee')
      .populate('recordedBy', 'username firstName lastName')
      .sort({ date: -1 })

    res.status(200).json({
      success: true,
      message: 'Event entrance records retrieved successfully',
      data: entrances
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
          totalRevenue: { $sum: { $multiply: ['$count', event.entranceFee] } }
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
          revenue: { $sum: { $multiply: ['$count', event.entranceFee] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const result = {
      event: {
        _id: event._id,
        eventName: event.eventName,
        entranceFee: event.entranceFee
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

// Get capacity status for an event
export const getCapacityStatus = async (req, res) => {
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

    // Get current total entrances
    const currentTotal = await getCurrentTotalEntrances(eventID);
    // Capacity status removed (maxCapacity field removed)

    const capacityStatus = {
      event: {
        _id: event._id,
        eventName: event.eventName
      },
      currentTotal,
      remainingCapacity: null,
      isAtCapacity: false,
      capacityPercentage: null
    };

    res.status(200).json({
      success: true,
      message: 'Capacity status retrieved successfully',
      data: capacityStatus
    });
  } catch (error) {
    console.error('Error getting capacity status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch capacity status',
      error: error.message
    });
  }
};
