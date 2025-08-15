import CageRental from '../models/cageRental.model.js';
import CageAvailability from '../models/cageAvailability.model.js';
import Event from '../models/event.model.js';
import { sendCageRentalReminderEmail, sendCageRentalPaymentConfirmationEmail } from '../services/email.service.js';

// Create a new cage rental
export const createCageRental = async (req, res) => {
    try {
        const {
            cageNo,
            arena,
            price,
            date,
            nameOfRenter,
            contactNumber,
            email,
            eventID,
            notes,
            paymentStatus = 'unpaid'
        } = req.body;

        // Validate required fields
        const requiredFields = ['cageNo', 'price', 'date', 'nameOfRenter', 'eventID'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate arena
        const validArenas = ['Buenavista Cockpit Arena', 'Mogpog Cockpit Arena', 'Boac Cockpit Arena'];
        if (!validArenas.includes(arena)) {
            return res.status(400).json({
                success: false,
                message: `Invalid arena. Must be one of: ${validArenas.join(', ')}`
            });
        }

        // Validate date format
        const rentalDate = new Date(date);
        if (isNaN(rentalDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }

        // Validate event exists
        const event = await Event.findById(eventID);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Referenced event not found'
            });
        }

        // Check if cage availability exists and is active
        const cageAvailability = await CageAvailability.findById(cageNo);
        if (!cageAvailability) {
            return res.status(404).json({
                success: false,
                message: 'Cage not found'
            });
        }

        // Ensure the arena matches the cage's arena
        if (cageAvailability.arena !== arena) {
            return res.status(400).json({
                success: false,
                message: `Cage ${cageAvailability.cageNumber} belongs to ${cageAvailability.arena}, not ${arena}`
            });
        }

        if (cageAvailability.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: `Cage ${cageAvailability.cageNumber} is not available for rental (status: ${cageAvailability.status})`
            });
        }

        // Create new cage rental
        const newCageRental = new CageRental({
            cageNo,
            arena,
            price: Number(price),
            date: rentalDate,
            nameOfRenter,
            contactNumber,
            email,
            eventID,
            notes,
            paymentStatus,
            recordedBy: req.user._id
        });

        const savedCageRental = await newCageRental.save();

        // Update cage availability status to rented
        await CageAvailability.findByIdAndUpdate(cageNo, { status: 'rented' });

        // Populate references for response
        await savedCageRental.populate([
            { path: 'cageNo', select: 'cageNumber availabilityNumber status arena' },
            { path: 'eventID', select: 'eventName date location' },
            { path: 'recordedBy', select: 'firstName lastName username' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Cage rental created successfully',
            data: savedCageRental
        });
    } catch (error) {
        console.error('Error creating cage rental:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all cage rentals with filtering and pagination
export const getAllCageRentals = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            paymentStatus,
            cageNo,
            arena,
            search,
            sortBy = 'date',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};

        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }

        if (cageNo) {
            filter.cageNo = cageNo;
        }

        if (arena) {
            filter.arena = arena;
        }

        if (search) {
            filter.$or = [
                { cageNo: { $regex: search, $options: 'i' } },
                { arena: { $regex: search, $options: 'i' } },
                { nameOfRenter: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Execute query
        const cageRentals = await CageRental.find(filter)
            .populate('cageNo', 'cageNumber availabilityNumber status arena')
            .populate('eventID', 'eventName date location')
            .populate('recordedBy', 'firstName lastName username')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        // Get total count for pagination
        const total = await CageRental.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Cage rentals retrieved successfully',
            data: cageRentals,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalItems: total,
                itemsPerPage: Number(limit)
            }
        });
    } catch (error) {
        console.error('Error getting cage rentals:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get cage rental by ID
export const getCageRentalById = async (req, res) => {
    try {
        const { id } = req.params;

        const cageRental = await CageRental.findById(id)
            .populate('cageNo', 'cageNumber availabilityNumber status arena')
            .populate('eventID', 'eventName date location')
            .populate('recordedBy', 'firstName lastName username');

        if (!cageRental) {
            return res.status(404).json({
                success: false,
                message: 'Cage rental not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cage rental retrieved successfully',
            data: cageRental
        });
    } catch (error) {
        console.error('Error getting cage rental:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update cage rental
export const updateCageRental = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Find the cage rental
        const cageRental = await CageRental.findById(id);

        if (!cageRental) {
            return res.status(404).json({
                success: false,
                message: 'Cage rental not found'
            });
        }

        // Check if user can update this rental (admin or the person who recorded it)
        if (req.user.role !== 'admin' && cageRental.recordedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update rentals you recorded'
            });
        }

        // Validate required fields
        const requiredFields = ['cageNo', 'price', 'date', 'nameOfRenter', 'eventID'];
        const missingFields = requiredFields.filter(field => !updateData[field] && !cageRental[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate arena if it's being updated
        if (updateData.arena) {
            const validArenas = ['Buenavista Cockpit Arena', 'Mogpog Cockpit Arena', 'Boac Cockpit Arena'];
            if (!validArenas.includes(updateData.arena)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid arena. Must be one of: ${validArenas.join(', ')}`
                });
            }
        }

        // Validate date if it's being updated
        if (updateData.date) {
            const rentalDate = new Date(updateData.date);
            if (isNaN(rentalDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date format'
                });
            }

            // Note: Removed date conflict check - if cage status is active, it can be rented regardless of existing rentals
        }

        // Validate event exists
        const event = await Event.findById(updateData.eventID || cageRental.eventID);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Referenced event not found'
            });
        }

        // Validate cage and arena consistency if cage is being updated
        if (updateData.cageNo) {
            const cageAvailability = await CageAvailability.findById(updateData.cageNo);
            if (!cageAvailability) {
                return res.status(404).json({
                    success: false,
                    message: 'Cage not found'
                });
            }

            const targetArena = updateData.arena || cageRental.arena;
            if (cageAvailability.arena !== targetArena) {
                return res.status(400).json({
                    success: false,
                    message: `Cage ${cageAvailability.cageNumber} belongs to ${cageAvailability.arena}, not ${targetArena}`
                });
            }

            // Ensure the cage is active for rental
            if (cageAvailability.status !== 'active') {
                return res.status(400).json({
                    success: false,
                    message: `Cage ${cageAvailability.cageNumber} is not available for rental (status: ${cageAvailability.status})`
                });
            }
        }

        // Convert numeric fields
        if (updateData.price) updateData.price = Number(updateData.price);

        // Update the cage rental
        const updatedCageRental = await CageRental.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate([
            { path: 'cageNo', select: 'cageNumber availabilityNumber status arena' },
            { path: 'eventID', select: 'eventName date location' },
            { path: 'recordedBy', select: 'firstName lastName username' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Cage rental updated successfully',
            data: updatedCageRental
        });
    } catch (error) {
        console.error('Error updating cage rental:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete cage rental
export const deleteCageRental = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the cage rental
        const cageRental = await CageRental.findById(id);

        if (!cageRental) {
            return res.status(404).json({
                success: false,
                message: 'Cage rental not found'
            });
        }

        // Check if user can delete this rental
        if (req.user.role !== 'admin' && cageRental.recordedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete rentals you recorded'
            });
        }

        // Check if rental can be deleted (only active rentals can be deleted)
        if (cageRental.rentalStatus === 'returned') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete returned rentals'
            });
        }

        await CageRental.findByIdAndDelete(id);

        // Restore cage availability status to active if the rental was active
        // If the rental was already returned, the cage should already be active
        if (cageRental.rentalStatus === 'active') {
            await CageAvailability.findByIdAndUpdate(cageRental.cageNo, { status: 'active' });
        }

        res.status(200).json({
            success: true,
            message: 'Cage rental deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting cage rental:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        if (!paymentStatus || !['paid', 'unpaid', 'pending', 'cancelled'].includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment status. Must be one of: paid, unpaid, pending, cancelled'
            });
        }

        // Find the cage rental
        const cageRental = await CageRental.findById(id);

        if (!cageRental) {
            return res.status(404).json({
                success: false,
                message: 'Cage rental not found'
            });
        }

        // Check if user can update this rental
        if (req.user.role !== 'admin' && cageRental.recordedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update rentals you recorded'
            });
        }

        // Store old payment status for email notification
        const oldPaymentStatus = cageRental.paymentStatus;

        // Update payment status
        const updatedCageRental = await CageRental.findByIdAndUpdate(
            id,
            { paymentStatus },
            { new: true, runValidators: true }
        ).populate([
            { path: 'cageNo', select: 'cageNumber availabilityNumber status arena' },
            { path: 'eventID', select: 'eventName date location' },
            { path: 'recordedBy', select: 'firstName lastName username' }
        ]);

        // Update cage availability status based on payment status
        if (paymentStatus === 'cancelled') {
            // Restore cage to active status if rental is cancelled
            await CageAvailability.findByIdAndUpdate(cageRental.cageNo, { status: 'active' });
        } else if (oldPaymentStatus === 'cancelled' && paymentStatus !== 'cancelled') {
            // Set cage back to rented if rental is reactivated
            await CageAvailability.findByIdAndUpdate(cageRental.cageNo, { status: 'rented' });
        }

        // Send email notifications if payment status changed
        if (oldPaymentStatus !== paymentStatus && cageRental.email) {
            if (paymentStatus === 'paid' && oldPaymentStatus !== 'paid') {
                await sendCageRentalPaymentConfirmationEmail(updatedCageRental);
            } else if (paymentStatus === 'unpaid' && oldPaymentStatus === 'paid') {
                await sendCageRentalReminderEmail(updatedCageRental);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Payment status updated successfully',
            data: updatedCageRental
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update rental status (return cage)
export const updateRentalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { rentalStatus } = req.body;

        if (!rentalStatus || !['active', 'returned'].includes(rentalStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid rental status. Must be one of: active, returned'
            });
        }

        // Find the cage rental
        const cageRental = await CageRental.findById(id);

        if (!cageRental) {
            return res.status(404).json({
                success: false,
                message: 'Cage rental not found'
            });
        }

        // Check if user can update this rental
        if (req.user.role !== 'admin' && cageRental.recordedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update rentals you recorded'
            });
        }

        // Store old rental status
        const oldRentalStatus = cageRental.rentalStatus;

        // Update rental status
        const updatedCageRental = await CageRental.findByIdAndUpdate(
            id,
            { rentalStatus },
            { new: true, runValidators: true }
        ).populate([
            { path: 'cageNo', select: 'cageNumber availabilityNumber status arena' },
            { path: 'eventID', select: 'eventName date location' },
            { path: 'recordedBy', select: 'firstName lastName username' }
        ]);

        // Update cage availability status based on rental status
        if (rentalStatus === 'returned') {
            // Restore cage to active status if rental is returned
            await CageAvailability.findByIdAndUpdate(cageRental.cageNo, { status: 'active' });
        } else if (oldRentalStatus === 'returned' && rentalStatus === 'active') {
            // Set cage back to rented if rental is reactivated
            await CageAvailability.findByIdAndUpdate(cageRental.cageNo, { status: 'rented' });
        }

        res.status(200).json({
            success: true,
            message: 'Rental status updated successfully',
            data: updatedCageRental
        });
    } catch (error) {
        console.error('Error updating rental status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get cage rentals by event
export const getCageRentalsByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { page = 1, limit = 10, paymentStatus } = req.query;

        // Build filter
        const filter = { eventID: eventId };

        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Execute query
        const cageRentals = await CageRental.find(filter)
            .populate('cageNo', 'cageNumber availabilityNumber status arena')
            .populate('eventID', 'eventName date location')
            .populate('recordedBy', 'firstName lastName username')
            .sort({ date: -1 })
            .skip(skip)
            .limit(Number(limit));

        // Get total count
        const total = await CageRental.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Cage rentals retrieved successfully',
            data: cageRentals,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalItems: total,
                itemsPerPage: Number(limit)
            }
        });
    } catch (error) {
        console.error('Error getting cage rentals by event:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get overdue rentals
export const getOverdueRentals = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // Find rentals that are unpaid and past their date
        const filter = {
            paymentStatus: 'unpaid',
            date: { $lt: new Date() },
            status: { $ne: 'cancelled' }
        };

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Execute query
        const overdueRentals = await CageRental.find(filter)
            .populate('cageNo', 'cageNumber availabilityNumber status arena')
            .populate('eventID', 'eventName date location')
            .populate('recordedBy', 'firstName lastName username')
            .sort({ date: 1 })
            .skip(skip)
            .limit(Number(limit));

        // Get total count
        const total = await CageRental.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Overdue rentals retrieved successfully',
            data: overdueRentals,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalItems: total,
                itemsPerPage: Number(limit)
            }
        });
    } catch (error) {
        console.error('Error getting overdue rentals:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get available cages for a specific date
export const getAvailableCages = async (req, res) => {
    try {
        const { date, arena } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date parameter is required'
            });
        }

        const rentalDate = new Date(date);

        // Build rental filter
        const rentalFilter = {
            date: {
                $gte: new Date(rentalDate.getFullYear(), rentalDate.getMonth(), rentalDate.getDate()),
                $lt: new Date(rentalDate.getFullYear(), rentalDate.getMonth(), rentalDate.getDate() + 1)
            },
            paymentStatus: { $ne: 'cancelled' }
        };

        // Add arena filter if specified
        if (arena) {
            rentalFilter.arena = arena;
        }

        // Get all cage numbers that are rented for this date
        const rentedCages = await CageRental.find(rentalFilter).select('cageNo');

        const rentedCageIds = rentedCages.map(rental => rental.cageNo);

        // Build cage filter
        const cageFilter = {
            status: 'active',
            _id: { $nin: rentedCageIds }
        };

        // Add arena filter to cage query if specified
        if (arena) {
            cageFilter.arena = arena;
        }

        // Get all active cages that are not rented for this date
        const availableCages = await CageAvailability.find(cageFilter).sort({ cageNumber: 1 });

        // Get rented cage details
        const rentedCageDetails = await CageAvailability.find({
            _id: { $in: rentedCageIds }
        }).sort({ cageNumber: 1 });

        res.status(200).json({
            success: true,
            message: 'Available cages retrieved successfully',
            data: {
                date: rentalDate,
                arena: arena || 'All Arenas',
                availableCages,
                rentedCages: rentedCageDetails,
                totalAvailable: availableCages.length,
                totalRented: rentedCageDetails.length
            }
        });
    } catch (error) {
        console.error('Error getting available cages:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get rental summary statistics
export const getRentalSummary = async (req, res) => {
    try {
        // Get overall statistics
        const totalRentals = await CageRental.countDocuments();
        const paidRentals = await CageRental.countDocuments({ paymentStatus: 'paid' });
        const unpaidRentals = await CageRental.countDocuments({ paymentStatus: 'unpaid' });

        // Calculate total revenue from paid rentals
        const paidRentalsData = await CageRental.find({ paymentStatus: 'paid' });
        const totalRevenue = paidRentalsData.reduce((sum, rental) => sum + rental.price, 0);

        // Get arena breakdown
        const arenaBreakdown = await CageRental.aggregate([
            {
                $group: {
                    _id: '$arena',
                    totalRentals: { $sum: 1 },
                    paidRentals: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } },
                    unpaidRentals: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, 1, 0] } },
                    revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$price', 0] } }
                }
            },
            {
                $project: {
                    arena: '$_id',
                    totalRentals: 1,
                    paidRentals: 1,
                    unpaidRentals: 1,
                    revenue: 1
                }
            },
            { $sort: { arena: 1 } }
        ]);

        // Get recent rentals (last 10)
        const recentRentals = await CageRental.find()
            .populate('cageNo', 'cageNumber')
            .populate('eventID', 'eventName')
            .sort({ createdAt: -1 })
            .limit(10)
            .select('nameOfRenter date price paymentStatus cageNo eventID');

        res.status(200).json({
            success: true,
            message: 'Rental summary retrieved successfully',
            data: {
                totalRentals,
                paidRentals,
                unpaidRentals,
                totalRevenue,
                arenaBreakdown,
                recentRentals
            }
        });
    } catch (error) {
        console.error('Error getting rental summary:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get current availability status
export const getAvailabilityStatus = async (req, res) => {
    try {
        const { date, arena } = req.query;
        const queryDate = date ? new Date(date) : new Date();

        // Build base filters
        const cageFilter = {};
        const rentalFilter = {
            date: {
                $gte: new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate()),
                $lt: new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate() + 1)
            },
            paymentStatus: { $ne: 'cancelled' }
        };

        // Add arena filter if specified
        if (arena) {
            cageFilter.arena = arena;
            rentalFilter.arena = arena;
        }

        // Get total cages from cage availability
        const totalCages = await CageAvailability.countDocuments(cageFilter);
        const activeCages = await CageAvailability.countDocuments({ ...cageFilter, status: 'active' });
        const rentedCages = await CageAvailability.countDocuments({ ...cageFilter, status: 'rented' });
        const inactiveCages = await CageAvailability.countDocuments({ ...cageFilter, status: 'inactive' });
        const maintenanceCages = await CageAvailability.countDocuments({ ...cageFilter, status: 'maintenance' });

        // Get rented cages for the specific date
        const dateRentedCages = await CageRental.find(rentalFilter);

        const totalRentedForDate = dateRentedCages.length;
        const totalAvailableForDate = activeCages - totalRentedForDate;

        // Calculate availability by payment status
        const paidRentals = dateRentedCages.filter(rental => rental.paymentStatus === 'paid').length;
        const unpaidRentals = dateRentedCages.filter(rental => rental.paymentStatus === 'unpaid').length;
        const pendingRentals = dateRentedCages.filter(rental => rental.paymentStatus === 'pending').length;

        // Get arena breakdown if no specific arena is requested
        let arenaBreakdown = null;
        if (!arena) {
            arenaBreakdown = await CageAvailability.aggregate([
                {
                    $group: {
                        _id: '$arena',
                        total: { $sum: 1 },
                        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                        inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
                        maintenance: { $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] } },
                        rented: { $sum: { $cond: [{ $eq: ['$status', 'rented'] }, 1, 0] } }
                    }
                },
                {
                    $project: {
                        arena: '$_id',
                        total: 1,
                        active: 1,
                        inactive: 1,
                        maintenance: 1,
                        rented: 1,
                        available: { $subtract: ['$active', '$rented'] }
                    }
                },
                { $sort: { arena: 1 } }
            ]);
        }

        res.status(200).json({
            success: true,
            message: 'Availability status retrieved successfully',
            data: {
                date: queryDate,
                arena: arena || 'All Arenas',
                totalCages,
                activeCages,
                rentedCages,
                inactiveCages,
                maintenanceCages,
                totalAvailableForDate,
                totalRentedForDate,
                availabilityBreakdown: {
                    paid: paidRentals,
                    unpaid: unpaidRentals,
                    pending: pendingRentals
                },
                availabilityPercentage: totalCages > 0 ? Math.round((totalAvailableForDate / totalCages) * 100) : 0,
                arenaBreakdown
            }
        });
    } catch (error) {
        console.error('Error getting availability status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
