import Event from '../models/event.model.js';

// Create a new event
export const createEvent = async (req, res) => {
    try {
        const {
            eventName,
            location,
            date,
            prize,
            eventType,
            noCockRequirements,
            maxParticipants,
            registrationDeadline,
            maxCapacity,
            isPublic
        } = req.body;

        // Validate required fields based on event type
        const basicRequiredFields = ['eventName', 'location', 'date', 'eventType', 'maxCapacity'];
        const missingBasicFields = basicRequiredFields.filter(field => !req.body[field]);

        if (missingBasicFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingBasicFields.join(', ')}`
            });
        }

        // Additional required fields for derby events
        if (eventType === 'derby') {
            const additionalRequiredFields = ['prize', 'noCockRequirements', 'maxParticipants', 'registrationDeadline'];
            const missingAdditionalFields = additionalRequiredFields.filter(field => !req.body[field]);

            if (missingAdditionalFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `For derby events, missing required fields: ${missingAdditionalFields.join(', ')}`
                });
            }
        }

        // Validate date is in the future
        const eventDate = new Date(date);
        if (eventDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Event date must be in the future'
            });
        }

        // Create new event
        const eventData = {
            eventName,
            location,
            date: eventDate,
            eventType,
            adminID: req.user._id,
            maxCapacity: Number(maxCapacity),
            maxParticipants: maxParticipants ? Number(maxParticipants) : null,
            registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
            isPublic: isPublic !== undefined ? isPublic : true
        };

        // Only add prize and noCockRequirements for derby events
        if (eventType === 'derby') {
            eventData.prize = Number(prize);
            eventData.noCockRequirements = Number(noCockRequirements);
        }

        const newEvent = new Event(eventData);

        const savedEvent = await newEvent.save();

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: savedEvent
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all events with filtering and pagination
export const getAllEvents = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            eventType,
            search,
            sortBy = 'date',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};

        // Role-based filtering
        if (req.user.role !== 'admin') {
            filter.isPublic = true;
        }

        if (status) {
            filter.status = status;
        }

        if (eventType) {
            filter.eventType = eventType;
        }

        if (search) {
            filter.$or = [
                { eventName: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Execute query
        const events = await Event.find(filter)
            .populate('adminID', 'firstName lastName username')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        // Get total count for pagination
        const total = await Event.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Events retrieved successfully',
            data: events,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalItems: total,
                itemsPerPage: Number(limit)
            }
        });
    } catch (error) {
        console.error('Error getting events:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get event by ID
export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findById(id)
            .populate('adminID', 'firstName lastName username');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user can access this event
        if (!event.isPublic && req.user.role !== 'admin' && event.adminID._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Event retrieved successfully',
            data: event
        });
    } catch (error) {
        console.error('Error getting event:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update event
export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Find the event
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user can update this event
        if (req.user.role !== 'admin' && event.adminID.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update events you created'
            });
        }

        // Validate required fields based on event type
        const eventType = updateData.eventType || event.eventType;
        const basicRequiredFields = ['eventName', 'location', 'date', 'eventType', 'maxCapacity'];
        const missingBasicFields = basicRequiredFields.filter(field => !updateData[field] && !event[field]);

        if (missingBasicFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingBasicFields.join(', ')}`
            });
        }

        // Additional required fields for derby events
        if (eventType === 'derby') {
            const additionalRequiredFields = ['prize', 'noCockRequirements', 'maxParticipants', 'registrationDeadline'];
            const missingAdditionalFields = additionalRequiredFields.filter(field => !updateData[field] && !event[field]);

            if (missingAdditionalFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `For derby events, missing required fields: ${missingAdditionalFields.join(', ')}`
                });
            }
        }

        // Validate date if it's being updated
        if (updateData.date) {
            const eventDate = new Date(updateData.date);
            if (eventDate <= new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'Event date must be in the future'
                });
            }
        }

        // Convert numeric fields conditionally
        if (updateData.prize) updateData.prize = Number(updateData.prize);
        if (updateData.noCockRequirements) updateData.noCockRequirements = Number(updateData.noCockRequirements);
        if (updateData.maxParticipants) updateData.maxParticipants = Number(updateData.maxParticipants);
        if (updateData.maxCapacity) updateData.maxCapacity = Number(updateData.maxCapacity);

        // For regular events, remove the fields that are not required
        if (eventType === 'regular') {
            delete updateData.prize;
            delete updateData.noCockRequirements;
            delete updateData.maxParticipants;
            delete updateData.registrationDeadline;
        }

        // Update the event
        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('adminID', 'firstName lastName username');

        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            data: updatedEvent
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete event
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the event
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user can delete this event
        if (req.user.role !== 'admin' && event.adminID.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete events you created'
            });
        }

        // Check if event can be deleted (not completed or cancelled)
        if (event.status === 'completed' || event.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete completed or cancelled events'
            });
        }

        await Event.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update event status
export const updateEventStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['draft', 'active', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: draft, active, completed, cancelled'
            });
        }

        // Find the event
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user can update this event
        if (req.user.role !== 'admin' && event.adminID.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update events you created'
            });
        }

        // Update status
        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        ).populate('adminID', 'firstName lastName username');

        res.status(200).json({
            success: true,
            message: 'Event status updated successfully',
            data: updatedEvent
        });
    } catch (error) {
        console.error('Error updating event status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get events by admin
export const getEventsByAdmin = async (req, res) => {
    try {
        const { adminId } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        // Build filter
        const filter = { adminID: adminId };

        if (status) {
            filter.status = status;
        }

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Execute query
        const events = await Event.find(filter)
            .populate('adminID', 'firstName lastName username')
            .sort({ date: -1 })
            .skip(skip)
            .limit(Number(limit));

        // Get total count
        const total = await Event.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Events retrieved successfully',
            data: events,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalItems: total,
                itemsPerPage: Number(limit)
            }
        });
    } catch (error) {
        console.error('Error getting events by admin:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get upcoming events
export const getUpcomingEvents = async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        const events = await Event.find({
            date: { $gt: new Date() },
            status: 'active',
            isPublic: true
        })
        .populate('adminID', 'firstName lastName username')
        .sort({ date: 1 })
        .limit(Number(limit));

        res.status(200).json({
            success: true,
            message: 'Upcoming events retrieved successfully',
            data: events
        });
    } catch (error) {
        console.error('Error getting upcoming events:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
