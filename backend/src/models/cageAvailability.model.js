import mongoose from "mongoose";

const cageAvailabilitySchema = new mongoose.Schema({
    cageNumber: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    arena: {
        type: String,
        required: true,
        enum: ['Buenavista Cockpit Arena', 'Mogpog Cockpit Arena', 'Boac Cockpit Arena'],
        default: 'Buenavista Cockpit Arena'
    },
    availabilityNumber: {
        type: Number,
        required: false,
        min: 0,
        default: 0
    },
    // Additional fields for better management
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance', 'rented'],
        default: 'active'
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    // Who recorded this cage
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
cageAvailabilitySchema.index({ cageNumber: 1, arena: 1 }, { unique: true });
cageAvailabilitySchema.index({ arena: 1 });
cageAvailabilitySchema.index({ status: 1 });
cageAvailabilitySchema.index({ recordedBy: 1 });

// Virtual for checking if cage is available
cageAvailabilitySchema.virtual('isAvailable').get(function() {
    return this.status === 'active';
});

// Method to get availability status
cageAvailabilitySchema.methods.getAvailabilityStatus = function() {
    if (this.status === 'inactive') return 'inactive';
    if (this.status === 'maintenance') return 'maintenance';
    if (this.status === 'rented') return 'rented';
    if (this.status === 'active') return 'active';
    return 'unknown';
};

// Pre-save middleware to set incremental availability number
cageAvailabilitySchema.pre('save', async function(next) {
    if (this.isNew) {
        // Get the highest availability number and increment by 1
        const highestCage = await this.constructor.findOne({}, {}, { sort: { 'availabilityNumber': -1 } });
        this.availabilityNumber = highestCage ? highestCage.availabilityNumber + 1 : 1;
    }
    next();
});

// Ensure virtual fields are serialized
cageAvailabilitySchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        ret.availabilityStatus = doc.getAvailabilityStatus();
        return ret;
    }
});

export default mongoose.model('CageAvailability', cageAvailabilitySchema);
