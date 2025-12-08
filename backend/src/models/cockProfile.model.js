import mongoose from "mongoose";

const cockProfileSchema = new mongoose.Schema({
  // Event association
  eventID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },

  // Participant association
  participantID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: true
  },

  entryNo: {
    type: Number,
    required: true,
    min: 1
  },

  // Fields for derby events only
  legband: {
    type: String,
    required: function () {
      // This will be validated in the controller based on event type
      return false; // We'll handle this in the controller
    },
    trim: true,
    minlength: 3,
    maxlength: 3,
    validate: {
      validator: function (v) {
        // If legband is provided, it must be exactly 3 digits (001-999)
        if (!v) return true; // Allow empty for non-Derby events
        return /^[0-9]{3}$/.test(v);
      },
      message: 'Legband must be exactly 3 digits (001-999)'
    }
  },

  weight: {
    type: Number,
    required: function () {
      // This will be validated in the controller based on event type
      return false; // We'll handle this in the controller
    },
    min: 10, // Minimum 10 grams
    max: 10000 // Maximum 10000 grams (10 kg)
  },

  isActive: {
    type: Boolean,
    default: true
  },

  status: {
    type: String,
    enum: ['available', 'scheduled', 'fought'],
    default: 'available'
  }
}, { timestamps: true });

cockProfileSchema.index({ eventID: 1, participantID: 1 });
cockProfileSchema.index({ eventID: 1, entryNo: 1 }, { unique: true });
// Only create legband index for documents where legband exists (derby events)
cockProfileSchema.index({ eventID: 1, legband: 1 }, { unique: true, sparse: true, partialFilterExpression: { legband: { $exists: true, $ne: null } } });
cockProfileSchema.index({ isActive: 1 });
cockProfileSchema.index({ status: 1 });
cockProfileSchema.index({ eventID: 1 });

export default mongoose.model('CockProfile', cockProfileSchema);
