import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Trophy, Clock, Users, Target, Award, Calendar, Info, Eye } from 'lucide-react'

export const createFightColumns = (formatCurrency, formatDate, handleEditClick, handleDeleteClick, handleAddResultClick, handleViewDetails) => [
  {
    key: 'fightNumber',
    label: 'Fight #',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">#{value}</span>
      </div>
    )
  },
  {
    key: 'participantsID',
    label: 'Participants & Cocks',
    sortable: false,
    filterable: false,
    render: (value, row) => (
      <div className="space-y-1">
        {value?.map((participant, index) => (
          <div key={participant._id} className="flex items-center gap-2 text-sm">
            <Users className="h-3 w-3" />
            <span>{participant.participantName}</span>
            {row.cockProfileID?.[index] && (
              <span className="text-xs text-muted-foreground">
                ({row.cockProfileID[index].entryNo || row.cockProfileID[index].legband || 'N/A'})
              </span>
            )}
          </div>
        ))}
      </div>
    )
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    filterable: true,
    filterOptions: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    filterValueMap: {
      'Scheduled': 'scheduled',
      'In Progress': 'in_progress',
      'Completed': 'completed',
      'Cancelled': 'cancelled'
    },
    render: (value) => {
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant={
              value === 'completed' ? 'default' :
                value === 'in_progress' ? 'secondary' :
                  value === 'cancelled' ? 'destructive' : 'outline'
            }
            className="text-xs capitalize"
          >
            {value.replace('_', ' ')}
          </Badge>
        </div>
      )
    }
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
    filterable: false,
    render: (_, row) => (
      <div className="flex items-center space-x-2">
        {row.status === 'scheduled' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleEditClick(row)
              }}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleAddResultClick(row)
              }}
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
            >
              <Trophy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteClick(row)
              }}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleViewDetails(row, 'fight')
          }}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    )
  }
]

export const createMatchResultColumns = (formatCurrency, formatDate, handleDeleteClick, handleViewDetails, handleStatusChange) => [
  {
    key: 'matchID',
    label: 'Fight #',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">#{value.fightNumber}</span>
      </div>
    )
  },
  {
    key: 'resultMatch',
    label: 'Match Result',
    sortable: false,
    filterable: false,
    render: (value) => (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <Trophy className="h-3 w-3 text-yellow-600" />
          <span className="font-medium text-green-600">Winner: {value.winnerParticipantID?.participantName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Loser: {value.loserParticipantID?.participantName}</span>
        </div>
      </div>
    )
  },
  {
    key: 'betWinner',
    label: 'Winner',
    sortable: true,
    filterable: true,
    filterOptions: ['Meron', 'Wala', 'Draw'],
    render: (value) => (
      <div className="flex items-center gap-2">
        <Award className="h-3 w-3 text-yellow-600" />
        <Badge
          variant={value === 'Meron' ? 'default' : value === 'Wala' ? 'secondary' : 'outline'}
          className="text-xs"
        >
          {value}
        </Badge>
      </div>
    )
  },
  {
    key: 'totalBetPool',
    label: 'Total Bet Pool',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-1">
        <Target className="h-4 w-4 text-green-600" />
        <span className="font-medium">{formatCurrency(value)}</span>
      </div>
    )
  },
  {
    key: 'payouts',
    label: 'Payout Info',
    sortable: false,
    filterable: false,
    render: (value, row) => {
      // Compute net winnings from row.participantBets (exclude winner's own stake)
      const bets = row.participantBets || []
      const meron = bets.find(b => b.position === 'Meron')
      const wala = bets.find(b => b.position === 'Wala')
      const meronAmt = meron?.betAmount || 0
      const walaAmt = wala?.betAmount || 0
      const opponentContribution = Math.min(meronAmt, walaAmt)
      const winnerIsMeron = row.betWinner === 'Meron'
      const outsideBets = Math.max(0, meronAmt - walaAmt)
      const winnerBetAmt = winnerIsMeron ? meronAmt : row.betWinner === 'Wala' ? walaAmt : 0
      const winnerPlazada = winnerBetAmt * 0.10

      const meronNet = winnerIsMeron ? Math.max(0, opponentContribution + outsideBets - winnerPlazada) : 0
      const walaNet = row.betWinner === 'Wala' ? Math.max(0, opponentContribution - winnerPlazada) : 0

      if (row.betWinner === 'Meron') {
        return (
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3 text-yellow-600" />
              <span className="text-green-600 font-medium">Meron: {formatCurrency(meronNet)}</span>
            </div>
          </div>
        )
      } else if (row.betWinner === 'Wala') {
        return (
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3 text-yellow-600" />
              <span className="text-green-600 font-medium">Wala: {formatCurrency(walaNet)}</span>
            </div>
          </div>
        )
      } else if (row.betWinner === 'Draw') {
        return (
          <div className="space-y-1 text-sm">
            <div className="text-muted-foreground">Draw - Bets returned</div>
          </div>
        )
      }
      return null
    }
  },
  {
    key: 'matchStartTime',
    label: 'Match Time',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatDate(value)}</span>
        </div>
      </div>
    )
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    filterable: true,
    filterOptions: ['Pending', 'Final'],
    filterValueMap: {
      'Pending': 'pending',
      'Final': 'final'
    },
    render: (value, row) => {
      // If status is final, show only a status badge
      if (value === 'final') {
        return (
          <Badge variant="default" className="text-xs">
            Final
          </Badge>
        )
      }

      // Otherwise show the full status with verification
      return (
        <div className="space-y-1">
          {row.verified && (
            <div className="text-xs text-green-600">
              ✓ Verified
            </div>
          )}
          {/* Status Change Dropdown - Only show when status is pending */}
          {row.status === 'pending' && (
            <select
              value={row.status}
              onChange={(e) => {
                e.stopPropagation()
                handleStatusChange(row._id, e.target.value, row.status)
              }}
              className="text-xs px-2 py-1 border rounded bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="pending">Pending</option>
              <option value="final">Final</option>
            </select>
          )}
          {row.status === 'final' && (
            <Badge variant="default" className="text-xs">
              Final
            </Badge>
          )}
        </div>
      )
    }
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
    filterable: false,
    render: (_, row) => (
      <div className="flex items-center space-x-2">
        {!row.verified && row.status !== 'final' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteClick(row)
              }}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleViewDetails(row, 'matchResult')
          }}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    )
  }
]

export const createChampionshipColumns = (formatCurrency) => [
  {
    key: 'position',
    label: 'Position',
    sortable: true,
    filterable: false,
    render: (value, row) => {
      if (!row.isChampion) return '-'

      const positionColors = {
        1: 'bg-yellow-500',
        2: 'bg-gray-400',
        3: 'bg-amber-600'
      }

      return (
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm ${positionColors[value] || 'bg-blue-500'
          }`}>
          {value}
        </div>
      )
    }
  },
  {
    key: 'participant',
    label: 'Participant',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div>
        <div className="font-medium">{value.participantName}</div>
        <div className="text-sm text-muted-foreground">{value.contactNumber}</div>
      </div>
    )
  },
  {
    key: 'wins',
    label: 'Wins',
    sortable: true,
    filterable: false,
    render: (value) => (
      <Badge variant="default" className="bg-green-100 text-green-800">
        {value}
      </Badge>
    )
  },
  {
    key: 'losses',
    label: 'Losses',
    sortable: true,
    filterable: false,
    render: (value) => (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        {value}
      </Badge>
    )
  },
  {
    key: 'totalMatches',
    label: 'Total',
    sortable: true,
    filterable: false,
    render: (value) => (
      <span className="font-medium">{value}</span>
    )
  },
  {
    key: 'remainingCocks',
    label: 'Remaining',
    sortable: true,
    filterable: false,
    render: (value) => (
      <span className="text-muted-foreground">{value}</span>
    )
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    filterable: true,
    filterOptions: ['Champion', 'Active', 'Eliminated'],
    render: (value, row) => (
      <Badge
        variant={
          row.isChampion ? 'default' :
            row.isEliminated ? 'destructive' : 'secondary'
        }
        className={
          row.isChampion ? 'bg-yellow-100 text-yellow-800' :
            row.isEliminated ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
        }
      >
        {value}
      </Badge>
    )
  },
  {
    key: 'prize',
    label: 'Prize',
    sortable: false,
    filterable: false,
    render: (value, row) => {
      if (!row.isChampion) return '-'

      return (
        <div className="text-center">
          <div className="font-semibold text-green-600">{row.prizePercentage}%</div>
          <div className="text-sm text-green-600">{formatCurrency(row.prizeAmount)}</div>
        </div>
      )
    }
  }
]
