import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, Clock, Users, Target, Award, Calendar, Info, Eye } from 'lucide-react'

export const createFightColumns = (formatCurrency, formatDate, handleViewDetails) => [
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
    key: 'position',
    label: 'Betting Info',
    sortable: false,
    filterable: false,
    render: (value) => (
      <div className="space-y-1">
        {value?.map((pos, index) => {
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Badge variant={pos.side === 'Meron' ? 'default' : 'secondary'} className="text-xs">
                {pos.side}
              </Badge>
              <span>{formatCurrency(pos.betAmount)}</span>
            </div>
          )
        })}
      </div>
    )
  },
  {
    key: 'totalBet',
    label: 'Total Bet',
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
    key: 'plazadaFee',
    label: 'Plazada Fee',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-1">
        <Trophy className="h-4 w-4 text-blue-600" />
        <span>{formatCurrency(value)}</span>
      </div>
    )
  },
  {
    key: 'scheduledTime',
    label: 'Scheduled Time',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span>{formatDate(value)}</span>
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
      // Helper function to get status icon
      const getStatusIcon = (status) => {
        switch (status) {
          case 'completed':
            return <Trophy className="h-3 w-3 text-green-600" />
          case 'in_progress':
            return <Clock className="h-3 w-3 text-blue-600" />
          case 'cancelled':
            return <Info className="h-3 w-3 text-red-600" />
          case 'scheduled':
          default:
            return <Calendar className="h-3 w-3 text-muted-foreground" />
        }
      }

      return (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
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

export const createMatchResultColumns = (formatCurrency, formatDate, handleViewDetails) => [
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
    key: 'totalBet',
    label: 'Total Bet',
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
    key: 'prize',
    label: 'Prize Info',
    sortable: false,
    filterable: false,
    render: (value) => (
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-1">
          <Trophy className="h-3 w-3 text-yellow-600" />
          <span className="text-green-600 font-medium">{formatCurrency(value.winnerPrize)}</span>
        </div>
        <div className="text-muted-foreground">
          House: {formatCurrency(value.houseCut)}
        </div>
      </div>
    )
  },
  {
    key: 'matchStartTime',
    label: 'Match Time',
    sortable: true,
    filterable: false,
    render: (value, row) => (
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatDate(value)}</span>
        </div>
        {row.resultMatch?.matchDuration && (
          <div className="text-muted-foreground">
            Duration: {row.resultMatch.matchDuration} min
          </div>
        )}
      </div>
    )
  },
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
