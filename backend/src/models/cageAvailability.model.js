import mongoose from "mongoose";

const cageAvailabilitySchema = new mongoose.Schema({
    cageNumber: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    // Additional fields for better management
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance', 'rented'],
        default: 'active'
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
cageAvailabilitySchema.index({ cageNumber: 1 }, { unique: true });
cageAvailabilitySchema.index({ status: 1 });
cageAvailabilitySchema.index({ recordedBy: 1 });

// Virtual for checking if cage is available
cageAvailabilitySchema.virtual('isAvailable').get(function () {
    return this.status === 'active';
});

// Method to get availability status
cageAvailabilitySchema.methods.getAvailabilityStatus = function () {
    if (this.status === 'inactive') return 'inactive';
    if (this.status === 'maintenance') return 'maintenance';
    if (this.status === 'rented') return 'rented';
    if (this.status === 'active') return 'active';
    return 'unknown';
};

// Ensure virtual fields are serialized
cageAvailabilitySchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        ret.availabilityStatus = doc.getAvailabilityStatus();
        return ret;
    }
});

export default mongoose.model('CageAvailability', cageAvailabilitySchema);
