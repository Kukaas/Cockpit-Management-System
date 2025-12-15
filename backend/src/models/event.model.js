import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    date: {
        type: Date,
        required: true
    },
    minimumBet: {
        type: Number,
        required: true,
        min: 0,
        default: 100
    },
    minimumParticipants: {
        type: Number,
        required: true,
        min: 1,
        default: 10
    },
    prize: {
        type: Number,
        required: function () {
            return this.eventType === 'derby' || this.eventType === 'hits_ulutan' || this.eventType === 'fastest_kill';
        },
        min: 0
    },
    eventType: {
        type: String,
        required: true,
        enum: ['regular', 'derby', 'fastest_kill', 'hits_ulutan'],
        default: 'regular'
    },
    noCockRequirements: {
        type: Number,
        required: function () {
            return this.eventType === 'derby' || this.eventType === 'hits_ulutan';
        },
        min: 0,
        max: 1000
    },
    // Derby-specific fields (weights in grams)
    minWeight: {
        type: Number,
        required: function () {
            return this.eventType === 'derby';
        },
        min: 10, // Minimum 10 grams
        max: 10000 // Maximum 10000 grams (10 kg)
    },
    maxWeight: {
        type: Number,
        required: function () {
            return this.eventType === 'derby';
        },
        min: 10, // Minimum 10 grams
        max: 10000, // Maximum 10000 grams (10 kg)
        validate: {
            validator: function (value) {
                // Only validate if both minWeight and maxWeight are set
                if (this.minWeight && value) {
                    return value >= this.minWeight;
                }
                return true;
            },
            message: 'maxWeight must be greater than or equal to minWeight'
        }
    },
    // Fastest Kill-specific fields
    prizeDistribution: [{
        tierName: {
            type: String,
            required: function () {
                return this.eventType === 'fastest_kill';
            },
            trim: true
        },
        startRank: {
            type: Number,
            required: function () {
                return this.eventType === 'fastest_kill';
            },
            min: 1
        },
        endRank: {
            type: Number,
            required: function () {
                return this.eventType === 'fastest_kill';
            },
            min: 1
        },
        percentage: {
            type: Number,
            required: function () {
                return this.eventType === 'fastest_kill';
            },
            min: 0,
            max: 100
        }
    }],
    adminID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    registrationDeadline: {
        type: Date,
        default: null
    },
    entranceFee: {
        type: Number,
        required: false,
        min: 0,
        default: 0
    },
    entryFee: {
        type: Number,
        required: false,
        min: 0,
        default: null
    },
    cageRentalFee: {
        type: Number,
        required: true,
        min: 0,
        default: 20
    }
}, {
    timestamps: true
});

// Index for better query performance
eventSchema.index({ adminID: 1, date: -1 });
eventSchema.index({ status: 1, date: -1 });
eventSchema.index({ eventType: 1 });

// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function () {
    return this.date > new Date() && this.status === 'active';
});

// Virtual for checking if event is past
eventSchema.virtual('isPast').get(function () {
    return this.date < new Date();
});

// Virtual for checking if registration is open
eventSchema.virtual('isRegistrationOpen').get(function () {
    if (this.status !== 'active') return false;
    if (this.registrationDeadline && new Date() > this.registrationDeadline) return false;
    return true;
});

// Method to get event status based on date
eventSchema.methods.getEventStatus = function () {
    const now = new Date();
    if (this.status === 'cancelled') return 'cancelled';
    if (this.status === 'completed') return 'completed';
    if (this.date < now) return 'completed';
    if (this.date > now) return 'upcoming';
    return 'ongoing';
};

// Ensure virtual fields are serialized
eventSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        ret.eventStatus = doc.getEventStatus();
        return ret;
    }
});

export default mongoose.model('Event', eventSchema);
