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
    }
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
  matchTimeSeconds: {
    type: Number,
    required: false,
    min: 0
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
  }
}, { timestamps: true });

// Indexes for better performance
matchResultSchema.index({ matchID: 1 }, { unique: true });
matchResultSchema.index({ betWinner: 1 });
matchResultSchema.index({ 'resultMatch.winnerParticipantID': 1 });
matchResultSchema.index({ status: 1 });
matchResultSchema.index({ verified: 1 });

// Pre-save middleware to calculate payouts
// NEW PLAZADA CALCULATION: Only the winner pays plazada (10% of their bet amount)
// Example: Player 1 bets 5000, Player 2 bets 4000
// - Total bet pool: 10000 (5000 + 4000 + 1000 outside bets)
// - If Player 1 wins: Plazada = 500 (10% of 5000), Winner gets 9500 (5000 + 4000 + 1000 - 500)
// - If Player 2 wins: Plazada = 400 (10% of 4000), Winner gets 7600 (4000 + 4000 - 400)
matchResultSchema.pre('save', function (next) {
  if (this.participantBets && this.participantBets.length === 2) {
    // Find Meron and Wala bets
    const meronBet = this.participantBets.find(bet => bet.position === 'Meron')
    const walaBet = this.participantBets.find(bet => bet.position === 'Wala')

    if (meronBet && walaBet) {
      const gap = Math.max(0, meronBet.betAmount - walaBet.betAmount) // Gap filled by outside bets (only positive)

      // Calculate total bet pool: Meron + Wala + Outside bets (gap)
      this.totalBetPool = meronBet.betAmount + walaBet.betAmount + gap

      // Calculate plazada only for the winner (10% of winner's bet)
      let winnerBet = null
      let totalPlazada = 0

      if (this.betWinner === 'Meron') {
        winnerBet = meronBet
        totalPlazada = meronBet.betAmount * 0.10
      } else if (this.betWinner === 'Wala') {
        winnerBet = walaBet
        totalPlazada = walaBet.betAmount * 0.10
      } else if (this.betWinner === 'Draw') {
        // Draw: no plazada collected
        totalPlazada = 0
      }

      this.totalPlazada = totalPlazada

      // Calculate payouts based on bet winner
      if (this.betWinner === 'Meron') {
        // When Meron wins, they get their bet + opponent's bet + outside bets - plazada
        this.payouts.meronPayout = meronBet.betAmount + walaBet.betAmount + gap - totalPlazada
        this.payouts.walaPayout = 0
      } else if (this.betWinner === 'Wala') {
        // When Wala wins, they get their bet + the smaller bet amount - plazada
        this.payouts.walaPayout = walaBet.betAmount + walaBet.betAmount - totalPlazada
        this.payouts.meronPayout = 0
      } else if (this.betWinner === 'Draw') {
        // Draw: each participant gets their bet amount back
        this.payouts.drawPayouts = this.participantBets.map(bet => ({
          participantID: bet.participantID,
          payout: bet.betAmount
        }))
        this.payouts.meronPayout = 0
        this.payouts.walaPayout = 0
      }

      // Set outside bets amount
      this.payouts.outsideBets = gap
    }
  }


  next()
})

// Post-save middleware to deactivate cocks after fight completion
matchResultSchema.post('save', async function (doc) {
  // Only deactivate cocks if this is a new result (not an update)
  if (this.isNew) {
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
  const winnerBet = this.participantBets.find(
    bet => bet.participantID.toString() === this.resultMatch.winnerParticipantID.toString()
  );

  if (winnerBet) {
    this.betWinner = winnerBet.position;
  }
};

// Method to assign Meron/Wala positions based on bet amounts
matchResultSchema.methods.assignPositions = function () {
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
  this.participantBets.forEach(bet => {
    bet.plazadaFee = bet.betAmount * 0.10; // 10% plazada
  });
};

// Method to validate match result
matchResultSchema.methods.validateResult = function () {
  const errors = [];


  if (!this.resultMatch.winnerParticipantID || !this.resultMatch.loserParticipantID) {
    errors.push('Winner and loser participants must be specified');
  }

  if (this.resultMatch.winnerParticipantID.toString() === this.resultMatch.loserParticipantID.toString()) {
    errors.push('Winner and loser cannot be the same participant');
  }

  if (!this.participantBets || this.participantBets.length !== 2) {
    errors.push('Exactly 2 participant bets are required');
  }

  return errors;
};

export default mongoose.model('MatchResult', matchResultSchema);
