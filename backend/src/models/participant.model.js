import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  // Participant Information
  participantName: {
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
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },

  // Event Information
  eventID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },

  // Registration Details
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['registered', 'confirmed', 'withdrawn', 'disqualified'],
    default: 'registered'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

participantSchema.index({ eventID: 1, participantName: 1 }, { unique: true });
participantSchema.index({ eventID: 1, status: 1 });
participantSchema.index({ registeredBy: 1 });
participantSchema.index({ registrationDate: -1 });
participantSchema.index({ participantName: 1 });

export default mongoose.model('Participant', participantSchema);
