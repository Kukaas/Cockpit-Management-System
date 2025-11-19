import mongoose from "mongoose";

const matchResultSchema = new mongoose.Schema({
  // Reference to the fight schedule
  matchID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FightSchedule',
    required: true
  },

  // Betting information for each participant
  participantBets: [{
    participantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
      required: true
    },
    betAmount: {
      type: Number,
      required: true,
      min: 0
    },
    position: {
      type: String,
      enum: ['Meron', 'Wala'],
      required: true
    }
  }],

  // Total bet pool (excluding plazada)
  totalBetPool: {
    type: Number,
    required: true,
    min: 0
  },

  // Total plazada collected
  totalPlazada: {
    type: Number,
    required: true,
    min: 0
  },

  // Winner of the bet (Meron, Wala, or Draw)
  betWinner: {
    type: String,
    enum: ['Meron', 'Wala', 'Draw', 'Cancelled'],
    required: true
  },

  // Result of the match
  resultMatch: {
    winnerParticipantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
      required: function () {
        const parent = this.parent();
        return parent && ['Meron', 'Wala'].includes(parent.betWinner);
      }
    },
    loserParticipantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
      required: function () {
        const parent = this.parent();
        return parent && ['Meron', 'Wala'].includes(parent.betWinner);
      }
    },
    winnerCockProfileID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CockProfile',
      required: function () {
        const parent = this.parent();
        return parent && ['Meron', 'Wala'].includes(parent.betWinner);
      }
    },
    loserCockProfileID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CockProfile',
      required: function () {
        const parent = this.parent();
        return parent && ['Meron', 'Wala'].includes(parent.betWinner);
      }
    },
    matchDuration: {
      type: Number, // in minutes
      min: 0
    },
  },

  // Payout information
  payouts: {
    meronPayout: {
      type: Number,
      min: 0,
      default: 0
    },
    walaPayout: {
      type: Number,
      min: 0,
      default: 0
    },
    drawPayouts: [{
      participantID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Participant'
      },
      payout: {
        type: Number,
        min: 0
      }
    }],
    outsideBets: {
      type: Number,
      min: 0,
      default: 0
    }
  },

  // Match time in seconds (for fastest kill events)
  // Note: Frontend converts minutes + seconds to total seconds before sending
  // Format: Total seconds as a number (e.g., 83.45 for 1 minute 23.45 seconds)
  matchTimeSeconds: {
    type: Number,
    required: false,
    min: 0,
    max: 600 // Maximum 10 minutes (reasonable limit for fastest kill)
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

  // Status of result processing
  status: {
    type: String,
    enum: ['pending', 'final'],
    default: 'pending'
  },

  // Prize amount for fastest kill events (optional, can be set later)
  prizeAmount: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  }
}, { timestamps: true });

// Indexes for better performance
matchResultSchema.index({ matchID: 1 }, { unique: true });
matchResultSchema.index({ betWinner: 1 });
matchResultSchema.index({ 'resultMatch.winnerParticipantID': 1 });
matchResultSchema.index({ status: 1 });
matchResultSchema.index({ verified: 1 });

// Pre-save middleware to calculate payouts
// NEW PLAZADA CALCULATION: Only the loser pays plazada (10% of their bet amount)
// Example: Meron bets 5000, Wala bets 3000
// - If Meron loses: Plazada = 500 (10% of 5000), Meron pays 5500 total (5000 + 500)
// - If Meron wins: Meron gets 5000 (their bet back, no plazada deduction)
// - If Wala loses: Plazada = 300 (10% of 3000), Wala pays 3300 total (3000 + 300)
// - If Wala wins: Wala gets 3000 (their bet back, no plazada deduction)
matchResultSchema.pre('save', function (next) {
  const hasBets = this.participantBets && this.participantBets.length === 2;
  const specialOutcome = ['Draw', 'Cancelled'].includes(this.betWinner);

  if (!hasBets || specialOutcome) {
    if (!hasBets || this.betWinner === 'Cancelled') {
      this.totalBetPool = 0;
      this.totalPlazada = 0;
      if (this.payouts) {
        this.payouts.meronPayout = 0;
        this.payouts.walaPayout = 0;
        this.payouts.drawPayouts = [];
        this.payouts.outsideBets = 0;
      }
      return next();
    }

    // Draw with bets entered - refund both participants
    const meronBet = this.participantBets.find(bet => bet.position === 'Meron');
    const walaBet = this.participantBets.find(bet => bet.position === 'Wala');

    if (meronBet && walaBet) {
      const gap = Math.max(0, meronBet.betAmount - walaBet.betAmount);
      this.totalBetPool = meronBet.betAmount + walaBet.betAmount + gap;
      this.totalPlazada = 0;
      this.payouts.drawPayouts = this.participantBets.map(bet => ({
        participantID: bet.participantID,
        payout: bet.betAmount
      }));
      this.payouts.meronPayout = 0;
      this.payouts.walaPayout = 0;
      this.payouts.outsideBets = gap;
    }

    return next();
  }

  // Find Meron and Wala bets
  const meronBet = this.participantBets.find(bet => bet.position === 'Meron')
  const walaBet = this.participantBets.find(bet => bet.position === 'Wala')

  if (meronBet && walaBet) {
    const gap = Math.max(0, meronBet.betAmount - walaBet.betAmount) // Gap filled by outside bets (only positive)

    // Calculate total bet pool: Meron + Wala + Outside bets (gap)
    this.totalBetPool = meronBet.betAmount + walaBet.betAmount + gap

    // Calculate plazada only from the loser (10% of loser's bet)
    let loserBet = null
    let totalPlazada = 0

    if (this.betWinner === 'Meron') {
      // Meron wins, Wala loses - plazada from Wala
      loserBet = walaBet
      totalPlazada = walaBet.betAmount * 0.10
    } else if (this.betWinner === 'Wala') {
      // Wala wins, Meron loses - plazada from Meron
      loserBet = meronBet
      totalPlazada = meronBet.betAmount * 0.10
    }

    this.totalPlazada = totalPlazada

    // Calculate payouts based on bet winner
    if (this.betWinner === 'Meron') {
      // When Meron wins: Meron gets their bet amount (5000), no plazada deduction
      this.payouts.meronPayout = meronBet.betAmount
      this.payouts.walaPayout = 0
    } else if (this.betWinner === 'Wala') {
      // When Wala wins: Wala gets their bet amount (3000), no plazada deduction
      this.payouts.walaPayout = walaBet.betAmount
      this.payouts.meronPayout = 0
    }

    // Set outside bets amount
    this.payouts.outsideBets = gap
  }

  next()
})

// Post-save middleware to deactivate cocks after fight completion
matchResultSchema.post('save', async function (doc) {
  // Only deactivate cocks if this is a new result (not an update) and there is a definitive winner
  if (this.isNew && ['Meron', 'Wala'].includes(doc.betWinner)) {
    try {
      const CockProfile = mongoose.model('CockProfile');

      // Deactivate both winner and loser cock profiles
      await CockProfile.updateMany(
        {
          _id: {
            $in: [doc.resultMatch.winnerCockProfileID, doc.resultMatch.loserCockProfileID]
          }
        },
        { isActive: false }
      );
    } catch (error) {
      console.error('Error deactivating cock profiles:', error);
    }
  }
});

// Method to determine the winning side based on participant
matchResultSchema.methods.determineBetWinner = function () {
  if (!this.resultMatch || !this.resultMatch.winnerParticipantID || !this.participantBets) {
    return;
  }

  const winnerBet = this.participantBets.find(
    bet => bet.participantID.toString() === this.resultMatch.winnerParticipantID.toString()
  );

  if (winnerBet) {
    this.betWinner = winnerBet.position;
  }
};

// Method to assign Meron/Wala positions based on bet amounts
matchResultSchema.methods.assignPositions = function () {
  if (!this.participantBets || this.participantBets.length !== 2) {
    return;
  }

  if (this.participantBets.length === 2) {
    const [bet1, bet2] = this.participantBets;

    if (bet1.betAmount > bet2.betAmount) {
      bet1.position = 'Meron';
      bet2.position = 'Wala';
    } else if (bet2.betAmount > bet1.betAmount) {
      bet2.position = 'Meron';
      bet1.position = 'Wala';
    } else {
      // Equal bets - assign randomly
      bet1.position = 'Meron';
      bet2.position = 'Wala';
    }
  }
};

// Method to calculate plazada fees
matchResultSchema.methods.calculatePlazada = function () {
  if (!this.participantBets) return;

  this.participantBets.forEach(bet => {
    bet.plazadaFee = bet.betAmount * 0.10; // 10% plazada
  });
};

// Method to validate match result
matchResultSchema.methods.validateResult = function () {
  const errors = [];


  if (['Meron', 'Wala'].includes(this.betWinner)) {
    if (!this.resultMatch.winnerParticipantID || !this.resultMatch.loserParticipantID) {
      errors.push('Winner and loser participants must be specified');
    }

    if (this.resultMatch.winnerParticipantID &&
      this.resultMatch.loserParticipantID &&
      this.resultMatch.winnerParticipantID.toString() === this.resultMatch.loserParticipantID.toString()) {
      errors.push('Winner and loser cannot be the same participant');
    }

    if (!this.participantBets || this.participantBets.length !== 2) {
      errors.push('Exactly 2 participant bets are required');
    }
  }

  return errors;
};

export default mongoose.model('MatchResult', matchResultSchema);
