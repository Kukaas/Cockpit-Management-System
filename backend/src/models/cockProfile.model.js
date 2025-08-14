import mongoose from "mongoose";

const cockProfileSchema = new mongoose.Schema({
  weight: {
    type: Number,
    required: true,
    min: 0.1,
    max: 10.0
  },
  legband: {
    type: String,
    required: true,
    trim: true,
    unique: true,
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

cockProfileSchema.index({ ownerName: 1, legband: 1 });
cockProfileSchema.index({ legband: 1 }, { unique: true });
cockProfileSchema.index({ isActive: 1 });

export default mongoose.model('CockProfile', cockProfileSchema);
