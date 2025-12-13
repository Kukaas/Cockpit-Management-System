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
    minlength: 10,
    maxlength: 11,
    validate: {
      validator: function (v) {
        return /^[0-9]{10,11}$/.test(v);
      },
      message: 'Contact number must be 10-11 digits and contain only numbers'
    }
  },
  entryName: {
    type: String,
    required: false, // Will be validated in controller for Derby events
    trim: true,
    maxlength: 100
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  entryFee: {
    type: Number,
    required: false,
    min: 0,
    default: 0
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

participantSchema.index({ eventID: 1, status: 1 });
participantSchema.index({ registeredBy: 1 });
participantSchema.index({ registrationDate: -1 });

export default mongoose.model('Participant', participantSchema);
