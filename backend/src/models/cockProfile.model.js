import mongoose from "mongoose";

const cockProfileSchema = new mongoose.Schema({
  // Event association
  eventID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },

  weight: {
    type: Number,
    required: true,
    min: 0.01,
    max: 10.0
  },
  legband: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  entryNo: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  ownerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, { timestamps: true });

cockProfileSchema.index({ eventID: 1, ownerName: 1 });
cockProfileSchema.index({ eventID: 1, legband: 1 });
cockProfileSchema.index({ legband: 1 }, { unique: true });
cockProfileSchema.index({ isActive: 1 });
cockProfileSchema.index({ eventID: 1 });

export default mongoose.model('CockProfile', cockProfileSchema);
