import mongoose from "mongoose";

const matchResultSchema = new mongoose.Schema({
  // Reference to the fight schedule
  matchID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FightSchedule',
    required: true
  },

  // Total bet amount from the fight
  totalBet: {
    type: Number,
    required: true,
    min: 0
  },

  // Winner of the bet (Meron or Wala)
  betWinner: {
    type: String,
    enum: ['Meron', 'Wala', 'Draw'],
    required: true
  },

  // Result of the match
  resultMatch: {
    winnerParticipantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
      required: true
    },
    loserParticipantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
      required: true
    },
    winnerCockProfileID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CockProfile',
      required: true
    },
    loserCockProfileID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CockProfile',
      required: true
    },
    matchDuration: {
      type: Number, // in minutes
      min: 0
    },
    matchType: {
      type: String,
      enum: ['knockout', 'decision', 'disqualification', 'forfeit'],
      required: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },

  // Prize distribution
  prize: {
    totalPrizePool: {
      type: Number,
      min: 0,
      default: 0
    },
    winnerPrize: {
      type: Number,
      min: 0,
      default: 0
    },
    houseCut: {
      type: Number,
      min: 0,
      default: 0
    },
    plazadaFee: {
      type: Number,
      min: 0,
      default: 0
    },
    netPayout: {
      type: Number,
      min: 0,
      default: 0
    }
  },

  // Match timing
  matchStartTime: {
    type: Date,
    required: true
  },

  matchEndTime: {
    type: Date,
    required: true
  },

  // Who recorded the result
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Verification status
  verified: {
    type: Boolean,
    default: false
  },

  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  verifiedAt: {
    type: Date
  },

  // Additional notes about the match
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },

  // Status of result processing
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'disputed', 'final'],
    default: 'pending'
  }
}, { timestamps: true });

// Indexes for better performance
matchResultSchema.index({ matchID: 1 }, { unique: true });
matchResultSchema.index({ betWinner: 1 });
matchResultSchema.index({ 'resultMatch.winnerParticipantID': 1 });
matchResultSchema.index({ matchStartTime: 1 });
matchResultSchema.index({ status: 1 });
matchResultSchema.index({ verified: 1 });

// Pre-save middleware to calculate prize distribution
matchResultSchema.pre('save', function(next) {
  if (this.totalBet > 0) {
    // Plazada fee should already be provided from fight schedule
    // If not provided, calculate it as 10% of base bet (fallback)
    if (!this.prize.plazadaFee) {
      this.prize.plazadaFee = this.totalBet * 0.10;
    }

    // House cut is calculated to make winner prize = total bet - 500
    // So if total bet is 10,500, winner gets 10,000, house cut is 500
    this.prize.houseCut = this.prize.plazadaFee; // House cut equals plazada fee

    // Winner gets total bet minus house cut only (plazada is collected separately)
    this.prize.winnerPrize = this.totalBet - this.prize.houseCut;

    // Total prize pool is same as winner prize
    this.prize.totalPrizePool = this.prize.winnerPrize;

    // Net payout (what winner actually receives)
    this.prize.netPayout = this.prize.winnerPrize;
  }

  // Calculate match duration if both times are set
  if (this.matchStartTime && this.matchEndTime) {
    const durationMs = this.matchEndTime.getTime() - this.matchStartTime.getTime();
    this.resultMatch.matchDuration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
  }

  next();
});

// Method to determine the winning side based on participant
matchResultSchema.methods.determineBetWinner = function(fightSchedule) {
  const winnerPosition = fightSchedule.position.find(
    p => p.participantID.toString() === this.resultMatch.winnerParticipantID.toString()
  );

  if (winnerPosition) {
    this.betWinner = winnerPosition.side;
  }
};

// Method to validate match result
matchResultSchema.methods.validateResult = function() {
  const errors = [];

  if (!this.matchStartTime || !this.matchEndTime) {
    errors.push('Match start and end times are required');
  }

  if (this.matchEndTime <= this.matchStartTime) {
    errors.push('Match end time must be after start time');
  }

  if (!this.resultMatch.winnerParticipantID || !this.resultMatch.loserParticipantID) {
    errors.push('Winner and loser participants must be specified');
  }

  if (this.resultMatch.winnerParticipantID.toString() === this.resultMatch.loserParticipantID.toString()) {
    errors.push('Winner and loser cannot be the same participant');
  }

  return errors;
};

export default mongoose.model('MatchResult', matchResultSchema);
