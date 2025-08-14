import CockProfile from '../models/cockProfile.model.js';

// Create new cock profile
export const createCockProfile = async (req, res) => {
  try {
    const { weight, legband, entryNo, ownerName, notes } = req.body;

    // Check if legband already exists
    const existingCock = await CockProfile.findOne({ legband });
    if (existingCock) {
      return res.status(400).json({ message: 'Cock with this legband already exists' });
    }

    const cockProfile = new CockProfile({
      weight,
      legband,
      entryNo,
      ownerName,
      notes
    });

    await cockProfile.save();
    res.status(201).json({ message: 'Cock profile created successfully', data: cockProfile });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create cock profile', error: error.message });
  }
};

// Get all cock profiles (with filtering)
export const getAllCockProfiles = async (req, res) => {
  try {
    const { page = 1, limit = 10, ownerName, isActive, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by owner name
    if (ownerName) {
      query.ownerName = { $regex: ownerName, $options: 'i' };
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Search functionality
    if (search) {
      query.$or = [
        { legband: { $regex: search, $options: 'i' } },
        { entryNo: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } }
      ];
    }

    const cockProfiles = await CockProfile.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CockProfile.countDocuments(query);

    res.json({
      data: cockProfiles,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalRecords: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cock profiles', error: error.message });
  }
};

// Get cock profile by ID
export const getCockProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const cockProfile = await CockProfile.findById(id);

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
    const { weight, legband, entryNo, ownerName, isActive, notes } = req.body;

    const cockProfile = await CockProfile.findById(id);
    if (!cockProfile) {
      return res.status(404).json({ message: 'Cock profile not found' });
    }

    // Check if legband is being changed and if it already exists
    if (legband && legband !== cockProfile.legband) {
      const existingCock = await CockProfile.findOne({ legband, _id: { $ne: id } });
      if (existingCock) {
        return res.status(400).json({ message: 'Cock with this legband already exists' });
      }
    }

    const updatedCockProfile = await CockProfile.findByIdAndUpdate(
      id,
      { weight, legband, entryNo, ownerName, isActive, notes },
      { new: true, runValidators: true }
    );

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

// Get cock profiles by owner name
export const getCockProfilesByOwnerName = async (req, res) => {
  try {
    const { ownerName } = req.params;
    const { isActive } = req.query;

    let query = { ownerName: { $regex: ownerName, $options: 'i' } };

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const cockProfiles = await CockProfile.find(query)
      .sort({ createdAt: -1 });

    res.json({ data: cockProfiles });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cock profiles', error: error.message });
  }
};
