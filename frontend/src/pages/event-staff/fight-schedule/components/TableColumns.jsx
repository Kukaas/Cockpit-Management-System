import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Trophy, Clock, Users, Target } from 'lucide-react'

export const createFightColumns = (formatCurrency, formatDate, handleEditClick, handleDeleteClick, handleAddResultClick) => [
  {
    key: 'fightNumber',
    label: 'Fight #',
    sortable: true,
    filterable: false,
    render: (value) => `#${value}`
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
    render: (value) => formatCurrency(value)
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
    render: (value) => (
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
    )
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
        {row.status === 'completed' && (
          <Badge variant="default" className="text-xs">
            Match Complete
          </Badge>
        )}
      </div>
    )
  }
]

export const createMatchResultColumns = (formatCurrency, formatDate, handleEditClick, handleDeleteClick, handleStatusChange) => [
  {
    key: 'matchID',
    label: 'Fight #',
    sortable: true,
    filterable: false,
    render: (value) => `#${value.fightNumber}`
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
      <Badge
        variant={value === 'Meron' ? 'default' : value === 'Wala' ? 'secondary' : 'outline'}
        className="text-xs"
      >
        {value}
      </Badge>
    )
  },
  {
    key: 'totalBet',
    label: 'Total Bet',
    sortable: true,
    filterable: false,
    render: (value) => formatCurrency(value)
  },
  {
    key: 'prize',
    label: 'Prize Info',
    sortable: false,
    filterable: false,
    render: (value) => (
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-1">
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
        <select
          value={value}
          onChange={(e) => handleStatusChange && handleStatusChange(row._id, e.target.value, value)}
          className="text-xs border rounded px-2 py-1 min-w-[90px]"
          disabled={row.verified && value === 'final'}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="disputed">Disputed</option>
          <option value="final">Final</option>
        </select>
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
        {(row.verified || row.status === 'final') && (
          <Badge variant="default" className="text-xs">
            Locked
          </Badge>
        )}
      </div>
    )
  }
]
