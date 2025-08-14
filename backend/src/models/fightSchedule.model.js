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

  // Betting information
  totalBet: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },

  // Plazada fee (10% of total bet)
  plazadaFee: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },

  // Entry numbers for the fight
  entryNo: [{
    type: String,
    required: true,
    trim: true
  }],

  // Position/side of each participant (Meron/Wala)
  position: [{
    participantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
      required: true
    },
    side: {
      type: String,
      enum: ['Meron', 'Wala'],
      required: true
    },
    betAmount: {
      type: Number,
      required: true,
      min: 0
    }
  }],

  // Odds status and information
  oddStatus: {
    meronOdds: {
      type: Number,
      default: 1.0,
      min: 0.1
    },
    walaOdds: {
      type: Number,
      default: 1.0,
      min: 0.1
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending'
    }
  },

  // Fight details
  fightNumber: {
    type: Number,
    required: true
  },

  scheduledTime: {
    type: Date,
    default: Date.now
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
  },

  // Additional notes
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, { timestamps: true });

// Indexes for better performance
fightScheduleSchema.index({ eventID: 1, fightNumber: 1 }, { unique: true });
fightScheduleSchema.index({ eventID: 1, status: 1 });
fightScheduleSchema.index({ scheduledTime: 1 });
fightScheduleSchema.index({ status: 1 });

// Virtual for getting match ID (used by match results)
fightScheduleSchema.virtual('matchID').get(function() {
  return this._id;
});

// Pre-save middleware to calculate plazada fee
fightScheduleSchema.pre('save', function(next) {
  if (this.position.length === 2) {
    // Find the base bet (the smaller amount, which is the original bet without plazada)
    const [pos1, pos2] = this.position;
    const baseBet = Math.min(pos1.betAmount, pos2.betAmount);

    // Plazada fee is 10% of the base bet only
    this.plazadaFee = baseBet * 0.10;

    // Total bet is the sum of both positions
    this.totalBet = pos1.betAmount + pos2.betAmount;
  }
  next();
});

// Method to determine Meron and Wala based on bet amounts
fightScheduleSchema.methods.assignPositions = function() {
  if (this.position.length === 2) {
    const [pos1, pos2] = this.position;

    // Higher bet amount is Meron, lower is Wala
    if (pos1.betAmount > pos2.betAmount) {
      pos1.side = 'Meron';
      pos2.side = 'Wala';
    } else if (pos2.betAmount > pos1.betAmount) {
      pos2.side = 'Meron';
      pos1.side = 'Wala';
    } else {
      // Equal bets - assign randomly or by other criteria
      pos1.side = 'Meron';
      pos2.side = 'Wala';
    }
  }
};

// Method to calculate odds
fightScheduleSchema.methods.calculateOdds = function() {
  if (this.position.length === 2) {
    const meronBet = this.position.find(p => p.side === 'Meron')?.betAmount || 0;
    const walaBet = this.position.find(p => p.side === 'Wala')?.betAmount || 0;

    if (meronBet > 0 && walaBet > 0) {
      // Simple odds calculation based on bet ratio
      this.oddStatus.meronOdds = walaBet / meronBet;
      this.oddStatus.walaOdds = meronBet / walaBet;
    }
  }
};

export default mongoose.model('FightSchedule', fightScheduleSchema);
