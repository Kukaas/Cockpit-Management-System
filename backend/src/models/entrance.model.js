import mongoose from "mongoose";

const entranceSchema = new mongoose.Schema({
  // Event Information
  eventID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },

  // Person Information (for potential participant registration later)
  personName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },

  // Entrance Details
  entranceFee: {
    type: Number,
    required: true,
    min: 0
  },

  // Date and Time
  date: {
    type: Date,
    required: true,
    default: Date.now
  },

  // Tracking Information
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Optional tracking fields
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },

  // Status for tracking purposes
  status: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'paid'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
entranceSchema.index({ eventID: 1, date: -1 });
entranceSchema.index({ recordedBy: 1 });
entranceSchema.index({ date: -1 });
entranceSchema.index({ status: 1 });
entranceSchema.index({ personName: 1 });
entranceSchema.index({ email: 1 });

// Virtual for getting event details
entranceSchema.virtual('event', {
  ref: 'Event',
  localField: 'eventID',
  foreignField: '_id',
  justOne: true
});

// Virtual for getting recorder details
entranceSchema.virtual('recorder', {
  ref: 'User',
  localField: 'recordedBy',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
entranceSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.model('Entrance', entranceSchema);
