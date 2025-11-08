import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, Clock, Users, Target, Award, Calendar, Info, Eye } from 'lucide-react'

export const createFightColumns = (formatCurrency, formatDate, handleViewDetails, eventType = 'regular') => [
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
    label: 'Participants',
    sortable: false,
    filterable: false,
    render: (value) => (
      <div className="space-y-1">
        {value?.map((participant) => (
          <div key={participant._id} className="flex items-center gap-2 text-sm">
            <Users className="h-3 w-3" />
            <span>{participant.participantName}</span>
          </div>
        ))}
      </div>
    )
  },
  {
    key: 'cockProfileID',
    label: 'Cock Profiles',
    sortable: false,
    filterable: false,
    render: (value) => (
      <div className="space-y-1">
        {value?.map((cock) => (
          <div key={cock._id} className="flex items-center gap-2 text-sm">
            <Trophy className="h-3 w-3 text-purple-600" />
            <span>
              #{cock.entryNo}
              {eventType === 'derby' && ` - ${cock.legband} (${cock.weight}kg)`}
            </span>
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
    )
  }
]

export const createMatchResultColumns = (formatCurrency, formatDate, handleViewDetails, eventType = 'regular') => [
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
    label: 'Bet Winner',
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
    key: 'totalPlazada',
    label: 'Total Plazada',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-1">
        <Trophy className="h-4 w-4 text-emerald-600" />
        <span className="font-medium">{formatCurrency(value)}</span>
      </div>
    )
  },
  // Only show match time for fastest kill events
  ...(eventType === 'fastest_kill' ? [
    {
      key: 'matchTimeSeconds',
      label: 'Match Time',
      sortable: true,
      filterable: false,
      render: (value) => {
        if (!value) return <span>N/A</span>
        const minutes = Math.floor(value / 60)
        const seconds = (value % 60).toFixed(2)
        const displayTime = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
        return (
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{displayTime}</span>
            </div>
          </div>
        )
      }
    }
  ] : []),
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    filterable: true,
    filterOptions: ['Pending', 'Confirmed', 'Disputed', 'Final'],
    filterValueMap: {
      'Pending': 'pending',
      'Confirmed': 'confirmed',
      'Disputed': 'disputed',
      'Final': 'final'
    },
    render: (value, row) => (
      <div className="space-y-1">
        <Badge
          variant={
            value === 'final' ? 'default' :
              value === 'confirmed' ? 'secondary' :
                value === 'disputed' ? 'destructive' : 'outline'
          }
          className="text-xs capitalize"
        >
          {value}
        </Badge>
        {row.verified && (
          <div className="text-xs text-green-600">
            ✓ Verified
          </div>
        )}
      </div>
    )
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
    filterable: false,
    render: (_, row) => (
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
