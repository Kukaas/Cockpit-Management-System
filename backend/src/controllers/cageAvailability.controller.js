import CageAvailability from '../models/cageAvailability.model.js';

// Create a new cage availability record
export const createCageAvailability = async (req, res) => {
    try {
        const {
            cageNumber,
            arena = 'Buenavista Cockpit Arena',
            status = 'active'
        } = req.body;

        // Validate required fields
        const requiredFields = ['cageNumber'];
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

        // Check if cage number already exists in the same arena
        const existingCage = await CageAvailability.findOne({ cageNumber, arena });
        if (existingCage) {
            return res.status(400).json({
                success: false,
                message: `Cage ${cageNumber} already exists in ${arena}`
            });
        }

        // Create new cage availability record
        const newCageAvailability = new CageAvailability({
            cageNumber,
            arena,
            status,
            recordedBy: req.user._id
        });

        const savedCageAvailability = await newCageAvailability.save();

        // Populate references for response
        await savedCageAvailability.populate('recordedBy', 'firstName lastName username');

        res.status(201).json({
            success: true,
            message: 'Cage availability created successfully',
            data: savedCageAvailability
        });
    } catch (error) {
        console.error('Error creating cage availability:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            if (field === 'cageNumber') {
                return res.status(400).json({
                    success: false,
                    message: `Cage number "${req.body.cageNumber}" already exists in ${req.body.arena || 'the selected arena'}. Please use a different cage number.`
                });
            }
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Bulk create cage availability records with auto-generated cage numbers
export const bulkCreateCageAvailability = async (req, res) => {
    try {
        const {
            arena = 'Buenavista Cockpit Arena',
            status = 'active',
            count = 1
        } = req.body;

        // Validate required fields
        if (!count || count < 1 || count > 100) {
            return res.status(400).json({
                success: false,
                message: 'Count must be between 1 and 100'
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

        // Get existing cages in the arena to check for duplicates
        const existingCages = await CageAvailability.find({ arena })
            .select('cageNumber');

        const existingCageNumbers = new Set(existingCages.map(cage => cage.cageNumber));

        // Create cage records with unique numbers
        const cagesToCreate = [];
        const createdCages = [];

        for (let i = 0; i < count; i++) {
            let cageNumber;
            let attempts = 0;
            const maxAttempts = 100;

            // Generate unique cage number with 5 digits
            do {
                // Generate a random 5-digit number
                const randomNumber = Math.floor(Math.random() * 90000) + 10000; // 10000 to 99999
                cageNumber = `C${randomNumber}`;
                attempts++;

                if (attempts > maxAttempts) {
                    return res.status(500).json({
                        success: false,
                        message: 'Unable to generate unique cage numbers. Please try again.'
                    });
                }
            } while (existingCageNumbers.has(cageNumber));

            // Add to existing numbers set to avoid duplicates within this batch
            existingCageNumbers.add(cageNumber);

            cagesToCreate.push({
                cageNumber,
                arena,
                status,
                recordedBy: req.user._id
            });
        }

        // Insert all cages
        if (cagesToCreate.length > 0) {
            const savedCages = await CageAvailability.insertMany(cagesToCreate);

            // Populate references for response
            await CageAvailability.populate(savedCages, {
                path: 'recordedBy',
                select: 'firstName lastName username'
            });

            createdCages.push(...savedCages);
        }

        res.status(201).json({
            success: true,
            message: `${createdCages.length} cages created successfully`,
            data: {
                createdCages,
                totalCreated: createdCages.length,
                arena,
                status
            }
        });
    } catch (error) {
        console.error('Error bulk creating cage availability:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Some cage numbers already exist in the selected arena. Please try again.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all cage availability records with filtering and pagination
export const getAllCageAvailability = async (req, res) => {
    try {
        const {
            status,
            arena,
            search,
            sortBy = 'cageNumber',
            sortOrder = 'asc'
        } = req.query;

        // Build filter object
        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (arena) {
            filter.arena = arena;
        }

        if (search) {
            filter.$or = [
                { cageNumber: { $regex: search, $options: 'i' } },
                { arena: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query without pagination
        const cageAvailability = await CageAvailability.find(filter)
            .populate('recordedBy', 'firstName lastName username')
            .sort(sort);

        // Get total count
        const total = await CageAvailability.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Cage availability retrieved successfully',
            data: cageAvailability,
            total: total
        });
    } catch (error) {
        console.error('Error getting cage availability:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get cage availability by ID
export const getCageAvailabilityById = async (req, res) => {
    try {
        const { id } = req.params;

        const cageAvailability = await CageAvailability.findById(id)
            .populate('recordedBy', 'firstName lastName username');

        if (!cageAvailability) {
            return res.status(404).json({
                success: false,
                message: 'Cage availability not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cage availability retrieved successfully',
            data: cageAvailability
        });
    } catch (error) {
        console.error('Error getting cage availability:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update cage availability
export const updateCageAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Find the cage availability record
        const cageAvailability = await CageAvailability.findById(id);

        if (!cageAvailability) {
            return res.status(404).json({
                success: false,
                message: 'Cage availability not found'
            });
        }

        // Check if user can update this record (admin or the person who recorded it)
        if (req.user.role !== 'admin' && cageAvailability.recordedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update records you created'
            });
        }

        // Validate required fields
        const requiredFields = ['cageNumber'];
        const missingFields = requiredFields.filter(field => !updateData[field] && !cageAvailability[field]);

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

        // Check if cage number is being changed and if it already exists in the same arena
        const targetArena = updateData.arena || cageAvailability.arena;
        if (updateData.cageNumber && updateData.cageNumber !== cageAvailability.cageNumber) {
            const existingCage = await CageAvailability.findOne({
                cageNumber: updateData.cageNumber,
                arena: targetArena,
                _id: { $ne: id }
            });
            if (existingCage) {
                return res.status(400).json({
                    success: false,
                    message: `Cage ${updateData.cageNumber} already exists in ${targetArena}`
                });
            }
        }

        // Update the cage availability record
        const updatedCageAvailability = await CageAvailability.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('recordedBy', 'firstName lastName username');

        res.status(200).json({
            success: true,
            message: 'Cage availability updated successfully',
            data: updatedCageAvailability
        });
    } catch (error) {
        console.error('Error updating cage availability:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            if (field === 'cageNumber') {
                return res.status(400).json({
                    success: false,
                    message: `Cage number "${req.body.cageNumber}" already exists in ${req.body.arena || 'the selected arena'}. Please use a different cage number.`
                });
            }
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete cage availability
export const deleteCageAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the cage availability record
        const cageAvailability = await CageAvailability.findById(id);

        if (!cageAvailability) {
            return res.status(404).json({
                success: false,
                message: 'Cage availability not found'
            });
        }

        // Check if user can delete this record
        if (req.user.role !== 'admin' && cageAvailability.recordedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete records you created'
            });
        }

        await CageAvailability.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Cage availability deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting cage availability:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get available cages for rental selection
export const getAvailableCagesForRental = async (req, res) => {
    try {
        const { date, arena } = req.query;

        // Build filter for active cages
        const cageFilter = { status: 'active' };
        if (arena) {
            cageFilter.arena = arena;
        }

        // Get all active cages (optionally filtered by arena)
        const allCages = await CageAvailability.find(cageFilter)
            .sort({ cageNumber: 1 });

        // If date is provided, check which cages are rented for that date
        if (date) {
            const rentalDate = new Date(date);

            // Import CageRental model here to avoid circular dependency
            const CageRental = (await import('../models/cageRental.model.js')).default;

            // Build rental filter
            const rentalFilter = {
                date: {
                    $gte: new Date(rentalDate.getFullYear(), rentalDate.getMonth(), rentalDate.getDate()),
                    $lt: new Date(rentalDate.getFullYear(), rentalDate.getMonth(), rentalDate.getDate() + 1)
                },
                paymentStatus: { $ne: 'cancelled' }
            };

            // Add arena filter to rental query if specified
            if (arena) {
                rentalFilter.arena = arena;
            }

            // Get rented cages for the date
            const rentedCages = await CageRental.find(rentalFilter).select('cages.cageNo');

            const rentedCageIds = rentedCages.flatMap(rental =>
                rental.cages.map(cage => cage.cageNo)
            );

            // Filter out rented cages
            const availableCages = allCages.filter(cage =>
                !rentedCageIds.includes(cage._id.toString())
            );

            res.status(200).json({
                success: true,
                message: 'Available cages retrieved successfully',
                data: {
                    date: rentalDate,
                    arena: arena || 'All Arenas',
                    availableCages,
                    totalAvailable: availableCages.length,
                    totalCages: allCages.length
                }
            });
        } else {
            // Return all active cages
            res.status(200).json({
                success: true,
                message: 'All active cages retrieved successfully',
                data: {
                    arena: arena || 'All Arenas',
                    cages: allCages,
                    totalCages: allCages.length
                }
            });
        }
    } catch (error) {
        console.error('Error getting available cages:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get cage availability summary
export const getCageAvailabilitySummary = async (req, res) => {
    try {
        const totalCages = await CageAvailability.countDocuments();
        const activeCages = await CageAvailability.countDocuments({ status: 'active' });
        const inactiveCages = await CageAvailability.countDocuments({ status: 'inactive' });
        const maintenanceCages = await CageAvailability.countDocuments({ status: 'maintenance' });

        // Get cages with active status (available for rental)
        const availableCages = await CageAvailability.countDocuments({
            status: 'active'
        });

        // Get arena breakdown
        const arenaBreakdown = await CageAvailability.aggregate([
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

        res.status(200).json({
            success: true,
            message: 'Cage availability summary retrieved successfully',
            data: {
                totalCages,
                activeCages,
                inactiveCages,
                maintenanceCages,
                availableCages,
                occupiedCages: totalCages - availableCages,
                arenaBreakdown
            }
        });
    } catch (error) {
        console.error('Error getting cage availability summary:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
