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
    type: String,
    required: true,
    trim: true,
  },

  // Fields for derby events only
  legband: {
    type: String,
    required: function() {
      // This will be validated in the controller based on event type
      return false; // We'll handle this in the controller
    },
    trim: true,
    maxlength: 50
  },

  weight: {
    type: Number,
    required: function() {
      // This will be validated in the controller based on event type
      return false; // We'll handle this in the controller
    },
    min: 0.01,
    max: 10.0
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

cockProfileSchema.index({ eventID: 1, participantID: 1 });
cockProfileSchema.index({ eventID: 1, entryNo: 1 }, { unique: true });
// Only create legband index for documents where legband exists (derby events)
cockProfileSchema.index({ eventID: 1, legband: 1 }, { unique: true, sparse: true, partialFilterExpression: { legband: { $exists: true, $ne: null } } });
cockProfileSchema.index({ isActive: 1 });
cockProfileSchema.index({ eventID: 1 });

export default mongoose.model('CockProfile', cockProfileSchema);
