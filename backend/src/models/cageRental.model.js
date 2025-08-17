import mongoose from "mongoose";

const cageRentalSchema = new mongoose.Schema({
    // Multiple cages can be rented in one transaction
    cages: [{
        cageNo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CageAvailability',
            required: true
        }
    }],
    arena: {
        type: String,
        required: true,
        enum: ['Buenavista Cockpit Arena', 'Mogpog Cockpit Arena', 'Boac Cockpit Arena'],
        default: 'Buenavista Cockpit Arena'
    },
    // Quantity of cages rented
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    // Total price (quantity * 20 PHP per cage)
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        required: true
    },
    nameOfRenter: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'unpaid', 'pending', 'cancelled'],
        default: 'paid' // Changed default to paid
    },
    rentalStatus: {
        type: String,
        enum: ['active', 'returned'],
        default: 'active'
    },
    // Required event reference for tracking purposes
    eventID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    // Contact information for the renter
    contactNumber: {
        type: String,
        trim: true,
        maxlength: 20
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 100
    },
    // Who recorded this rental
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
cageRentalSchema.index({ 'cages.cageNo': 1, date: -1 });
cageRentalSchema.index({ arena: 1, date: -1 });
cageRentalSchema.index({ paymentStatus: 1, date: -1 });
cageRentalSchema.index({ nameOfRenter: 1 });
cageRentalSchema.index({ eventID: 1 });
cageRentalSchema.index({ recordedBy: 1 });

// Virtual for checking if rental is overdue (unpaid and past date)
cageRentalSchema.virtual('isOverdue').get(function() {
    return this.paymentStatus === 'unpaid' && this.date < new Date();
});

// Virtual for checking if rental is upcoming
cageRentalSchema.virtual('isUpcoming').get(function() {
    return this.date > new Date() && this.paymentStatus !== 'cancelled';
});

// Method to get business status based on date and payment
cageRentalSchema.methods.getBusinessStatus = function() {
    const now = new Date();
    if (this.paymentStatus === 'cancelled') return 'cancelled';
    if (this.date < now && this.paymentStatus === 'unpaid') return 'overdue';
    return 'ongoing';
};

// Ensure virtual fields are serialized
cageRentalSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        // Keep the actual rentalStatus field as is, don't override it
        ret.businessStatus = doc.getBusinessStatus();
        return ret;
    }
});

export default mongoose.model('CageRental', cageRentalSchema);
