import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    location: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    date: {
        type: Date,
        required: true
    },
    prize: {
        type: Number,
        required: function () {
            return this.eventType === 'derby';
        },
        min: 0
    },
    eventType: {
        type: String,
        required: true,
        enum: ['regular', 'derby', 'fastest_kill'],
        default: 'regular'
    },
    noCockRequirements: {
        type: Number,
        required: function () {
            return this.eventType === 'derby';
        },
        min: 0,
        max: 1000
    },
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
    maxParticipants: {
        type: Number,
        min: 1,
        default: null
    },
    registrationDeadline: {
        type: Date,
        default: null
    },
    maxCapacity: {
        type: Number,
        required: true,
        min: 1
    },
    entranceFee: {
        type: Number,
        required: true,
        min: 0,
        default: 100
    },
    isPublic: {
        type: Boolean,
        default: true
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
