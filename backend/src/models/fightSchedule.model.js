import mongoose from "mongoose";

const fightScheduleSchema = new mongoose.Schema({
  // Event reference
  eventID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },

  // Participants in the fight (array of 2 participants)
  participantsID: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: true
  }],

  // Cock profiles for the fight (array of 2 cocks)
  cockProfileID: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CockProfile',
    required: true
  }],

  // Fight details
  fightNumber: {
    type: Number,
    required: true
  },


  // Status tracking
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },

  // Who scheduled this fight
  scheduledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Indexes for better performance
fightScheduleSchema.index({ eventID: 1, fightNumber: 1 }, { unique: true });
fightScheduleSchema.index({ eventID: 1, status: 1 });
fightScheduleSchema.index({ status: 1 });

// Virtual for getting match ID (used by match results)
fightScheduleSchema.virtual('matchID').get(function () {
  return this._id;
});

export default mongoose.model('FightSchedule', fightScheduleSchema);
