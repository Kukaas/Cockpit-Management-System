import mongoose from "mongoose";

const entranceSchema = new mongoose.Schema({
  // Event Information
  eventID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },

  // Tally Information
  count: {
    type: Number,
    required: true,
    min: 1,
    default: 1
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
  }
}, {
  timestamps: true
});

// Indexes for better query performance
entranceSchema.index({ eventID: 1, date: -1 });
entranceSchema.index({ recordedBy: 1 });
entranceSchema.index({ date: -1 });

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
