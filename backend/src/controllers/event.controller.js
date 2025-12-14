import Event from '../models/event.model.js';

// Create a new event
export const createEvent = async (req, res) => {
    try {
        const {
            eventName,
            date,
            minimumBet,
            minimumParticipants,
            prize,
            eventType,
            noCockRequirements,
            registrationDeadline,
            entranceFee,
            entryFee,
            cageRentalFee,
            minWeight,
            maxWeight,
            weightGap,
            winnerCount,
            prizeDistribution
        } = req.body;

        // Validate required fields based on event type
        const basicRequiredFields = ['eventName', 'date', 'eventType', 'cageRentalFee', 'minimumBet', 'minimumParticipants'];
        const missingBasicFields = basicRequiredFields.filter(field => !req.body[field]);

        if (missingBasicFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingBasicFields.join(', ')}`
            });
        }

        // Additional required fields for derby events
        if (eventType === 'derby') {
            const additionalRequiredFields = ['prize', 'noCockRequirements', 'registrationDeadline', 'minWeight', 'maxWeight', 'weightGap'];
            const missingAdditionalFields = additionalRequiredFields.filter(field => !req.body[field]);

            if (missingAdditionalFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `For derby events, missing required fields: ${missingAdditionalFields.join(', ')}`
                });
            }
        }

        // Additional required fields for hits_ulutan events (no registrationDeadline)
        if (eventType === 'hits_ulutan') {
            const additionalRequiredFields = ['prize', 'noCockRequirements'];
            const missingAdditionalFields = additionalRequiredFields.filter(field => !req.body[field]);

            if (missingAdditionalFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `For hits ulutan events, missing required fields: ${missingAdditionalFields.join(', ')}`
                });
            }
        }

        // Additional required fields for fastest_kill events
        if (eventType === 'fastest_kill') {
            const additionalRequiredFields = ['prize', 'prizeDistribution'];
            const missingAdditionalFields = additionalRequiredFields.filter(field => !req.body[field]);

            if (missingAdditionalFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `For fastest kill events, missing required fields: ${missingAdditionalFields.join(', ')}`
                });
            }

            // Validate prizeDistribution
            if (!Array.isArray(prizeDistribution) || prizeDistribution.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Prize distribution must be a non-empty array'
                });
            }

            // Validate that percentages sum to 100
            const totalPercentage = prizeDistribution.reduce((sum, tier) => sum + Number(tier.percentage), 0);
            if (Math.abs(totalPercentage - 100) > 0.01) {
                return res.status(400).json({
                    success: false,
                    message: `Prize distribution percentages must sum to 100%. Current total: ${totalPercentage}%`
                });
            }

            // Validate rank ranges
            for (const tier of prizeDistribution) {
                if (tier.startRank > tier.endRank) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid rank range in tier "${tier.tierName}": startRank (${tier.startRank}) must be <= endRank (${tier.endRank})`
                    });
                }
            }

            // Validate that rank ranges are continuous and don't overlap
            const sortedTiers = [...prizeDistribution].sort((a, b) => a.startRank - b.startRank);
            for (let i = 0; i < sortedTiers.length - 1; i++) {
                if (sortedTiers[i].endRank + 1 !== sortedTiers[i + 1].startRank) {
                    return res.status(400).json({
                        success: false,
                        message: 'Prize distribution tiers must be continuous without gaps or overlaps'
                    });
                }
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
            date: eventDate,
            eventType,
            adminID: req.user._id,
            minimumBet: Number(minimumBet),
            minimumParticipants: Number(minimumParticipants),
            entranceFee: Number(entranceFee),
            cageRentalFee: Number(cageRentalFee),
            registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null
        };

        // Add entryFee if provided (optional)
        if (entryFee !== undefined && entryFee !== null && entryFee !== '') {
            eventData.entryFee = Number(entryFee);
        } else {
            // Explicitly set to null if not provided
            eventData.entryFee = null;
        }

        // Only add prize and noCockRequirements for derby and hits_ulutan events
        if (eventType === 'derby' || eventType === 'hits_ulutan') {
            eventData.prize = Number(prize);
            eventData.noCockRequirements = Number(noCockRequirements);
        }

        // Add Derby-specific fields
        if (eventType === 'derby') {
            eventData.minWeight = Number(minWeight);
            eventData.maxWeight = Number(maxWeight);
            eventData.weightGap = Number(weightGap);

            // Validate weight range
            if (eventData.minWeight >= eventData.maxWeight) {
                return res.status(400).json({
                    success: false,
                    message: 'Minimum weight must be less than maximum weight'
                });
            }
        }

        // Only add prize for fastest_kill events
        if (eventType === 'fastest_kill') {
            eventData.prize = Number(prize);
            eventData.prizeDistribution = prizeDistribution.map(tier => ({
                tierName: tier.tierName,
                startRank: Number(tier.startRank),
                endRank: Number(tier.endRank),
                percentage: Number(tier.percentage)
            }));
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
            status,
            eventType,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (eventType) {
            filter.eventType = eventType;
        }

        if (search) {
            filter.$or = [
                { eventName: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object - default to createdAt descending to show newest first
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query
        const events = await Event.find(filter)
            .populate('adminID', 'firstName lastName username')
            .sort(sort)

        res.status(200).json({
            success: true,
            message: 'Events retrieved successfully',
            data: events
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
        const basicRequiredFields = ['eventName', 'date', 'eventType', 'minimumBet', 'minimumParticipants'];
        const missingBasicFields = basicRequiredFields.filter(field => !updateData[field] && !event[field]);

        if (missingBasicFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingBasicFields.join(', ')}`
            });
        }

        // Additional required fields for derby events
        if (eventType === 'derby') {
            const additionalRequiredFields = ['prize', 'noCockRequirements', 'registrationDeadline', 'minWeight', 'maxWeight', 'weightGap'];
            const missingAdditionalFields = additionalRequiredFields.filter(field => !updateData[field] && !event[field]);

            if (missingAdditionalFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `For derby events, missing required fields: ${missingAdditionalFields.join(', ')}`
                });
            }
        }

        // Additional required fields for hits_ulutan events (no registrationDeadline)
        if (eventType === 'hits_ulutan') {
            const additionalRequiredFields = ['prize', 'noCockRequirements'];
            const missingAdditionalFields = additionalRequiredFields.filter(field => !updateData[field] && !event[field]);

            if (missingAdditionalFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `For hits ulutan events, missing required fields: ${missingAdditionalFields.join(', ')}`
                });
            }
        }

        // Additional required fields for fastest_kill events
        if (eventType === 'fastest_kill') {
            const additionalRequiredFields = ['prize', 'prizeDistribution'];
            const missingAdditionalFields = additionalRequiredFields.filter(field => !updateData[field] && !event[field]);

            if (missingAdditionalFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `For fastest kill events, missing required fields: ${missingAdditionalFields.join(', ')}`
                });
            }

            // Validate prizeDistribution if provided
            const prizeDistribution = updateData.prizeDistribution || event.prizeDistribution;

            if (prizeDistribution) {
                if (!Array.isArray(prizeDistribution) || prizeDistribution.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Prize distribution must be a non-empty array'
                    });
                }

                // Validate that percentages sum to 100
                const totalPercentage = prizeDistribution.reduce((sum, tier) => sum + Number(tier.percentage), 0);
                if (Math.abs(totalPercentage - 100) > 0.01) {
                    return res.status(400).json({
                        success: false,
                        message: `Prize distribution percentages must sum to 100%. Current total: ${totalPercentage}%`
                    });
                }

                // Validate rank ranges
                for (const tier of prizeDistribution) {
                    if (tier.startRank > tier.endRank) {
                        return res.status(400).json({
                            success: false,
                            message: `Invalid rank range in tier "${tier.tierName}": startRank (${tier.startRank}) must be <= endRank (${tier.endRank})`
                        });
                    }

                    // Validate that rank ranges are continuous and don't overlap
                    const sortedTiers = [...prizeDistribution].sort((a, b) => a.startRank - b.startRank);
                    for (let i = 0; i < sortedTiers.length - 1; i++) {
                        if (sortedTiers[i].endRank + 1 !== sortedTiers[i + 1].startRank) {
                            return res.status(400).json({
                                success: false,
                                message: 'Prize distribution tiers must be continuous without gaps or overlaps'
                            });
                        }
                    }
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
            if (updateData.entranceFee) updateData.entranceFee = Number(updateData.entranceFee);
            if (updateData.cageRentalFee) updateData.cageRentalFee = Number(updateData.cageRentalFee);
            if (updateData.minimumBet) updateData.minimumBet = Number(updateData.minimumBet);
            if (updateData.minimumParticipants) updateData.minimumParticipants = Number(updateData.minimumParticipants);
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
        if (updateData.entranceFee) updateData.entranceFee = Number(updateData.entranceFee);
        if (updateData.cageRentalFee) updateData.cageRentalFee = Number(updateData.cageRentalFee);
        if (updateData.minimumBet) updateData.minimumBet = Number(updateData.minimumBet);
        if (updateData.minimumParticipants) updateData.minimumParticipants = Number(updateData.minimumParticipants);
        if (updateData.minWeight) updateData.minWeight = Number(updateData.minWeight);
        if (updateData.maxWeight) updateData.maxWeight = Number(updateData.maxWeight);
        if (updateData.weightGap) updateData.weightGap = Number(updateData.weightGap);

        // Validate weight range if both are being updated
        if (updateData.minWeight && updateData.maxWeight) {
            if (updateData.minWeight >= updateData.maxWeight) {
                return res.status(400).json({
                    success: false,
                    message: 'Minimum weight must be less than maximum weight'
                });
            }
        }

        if (updateData.prizeDistribution) {
            updateData.prizeDistribution = updateData.prizeDistribution.map(tier => ({
                tierName: tier.tierName,
                startRank: Number(tier.startRank),
                endRank: Number(tier.endRank),
                percentage: Number(tier.percentage)
            }));
        }

        // Handle entryFee - can be set, updated, or removed (set to null)
        if (updateData.entryFee !== undefined) {
            if (updateData.entryFee === '' || updateData.entryFee === null) {
                updateData.entryFee = null;
            } else {
                updateData.entryFee = Number(updateData.entryFee);
            }
        }

        // For regular events, remove the fields that are not required
        if (eventType === 'regular') {
            delete updateData.prize;
            delete updateData.noCockRequirements;
            delete updateData.registrationDeadline;
            delete updateData.minWeight;
            delete updateData.maxWeight;
            delete updateData.weightGap;
            delete updateData.prizeDistribution;
        }

        // For non-derby events, remove derby-specific fields
        if (eventType !== 'derby') {
            delete updateData.minWeight;
            delete updateData.maxWeight;
            delete updateData.registrationDeadline;
        }

        // For non-fastest_kill events, remove fastest kill-specific fields
        if (eventType !== 'fastest_kill') {
            delete updateData.prizeDistribution;
        }

        // For non-derby and non-hits_ulutan events, remove noCockRequirements
        if (eventType !== 'derby' && eventType !== 'hits_ulutan') {
            delete updateData.noCockRequirements;
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
        const { status } = req.query;

        // Build filter
        const filter = { adminID: adminId };

        if (status) {
            filter.status = status;
        }

        // Execute query
        const events = await Event.find(filter)
            .populate('adminID', 'firstName lastName username')
            .sort({ date: -1 })

        res.status(200).json({
            success: true,
            message: 'Events retrieved successfully',
            data: events
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
        const events = await Event.find({
            date: { $gt: new Date() },
            status: 'active'
        })
            .populate('adminID', 'firstName lastName username')
            .sort({ createdAt: -1 });

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
