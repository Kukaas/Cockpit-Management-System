import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Trophy, Target, Award, Clock } from 'lucide-react'

export const createViewOnlyParticipantColumns = (formatCurrency, handleViewDetails) => [
  {
    key: 'participantName',
    label: 'Participant Name',
    sortable: true,
    filterable: false
  },
  {
    key: 'contactNumber',
    label: 'Contact Number',
    sortable: true,
    filterable: false
  },
  {
    key: 'address',
    label: 'Address',
    sortable: true,
    filterable: false
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    filterable: true,
    filterOptions: ['registered', 'confirmed', 'withdrawn', 'disqualified'],
    render: (value) => (
      <Badge
        variant={
          value === 'confirmed' ? 'default' :
            value === 'withdrawn' ? 'destructive' :
              value === 'disqualified' ? 'secondary' : 'outline'
        }
        className="text-xs capitalize"
      >
        {value}
      </Badge>
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
          handleViewDetails(row, 'participant')
        }}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
    )
  }
]

export const createViewOnlyCockProfileColumns = (handleViewDetails, eventType = 'regular') => [
  {
    key: 'entryNo',
    label: 'Entry No.',
    sortable: true,
    filterable: false,
    render: (value) => `#${value}`
  },
  {
    key: 'participantID',
    label: 'Participant',
    sortable: true,
    filterable: false,
    render: (value) => value?.participantName || 'N/A'
  },
  // Only include legbandNumber and weight columns for derby events
  ...(eventType === 'derby' ? [
    {
      key: 'legband',
      label: 'Legband Number',
      sortable: true,
      filterable: false
    },
    {
      key: 'weight',
      label: 'Weight (grams)',
      sortable: true,
      filterable: false,
      render: (value) => value ? `${value} g` : 'N/A'
    }
  ] : []),
  {
    key: 'isActive',
    label: 'Status',
    sortable: true,
    filterable: true,
    filterOptions: ['Active', 'Inactive'],
    filterValueMap: {
      'Active': true,
      'Inactive': false
    },
    render: (value) => (
      <Badge
        variant={value ? 'default' : 'secondary'}
        className="text-xs"
      >
        {value ? 'Active' : 'Inactive'}
      </Badge>
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
          handleViewDetails(row, 'cockProfile')
        }}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
    )
  }
]

export const createViewOnlyFightScheduleColumns = (formatCurrency, formatDate, handleViewDetails) => [
  {
    key: 'fightNumber',
    label: 'Fight #',
    sortable: true,
    filterable: false
  },
  {
    key: 'participantsID',
    label: 'Participants',
    sortable: false,
    filterable: false,
    render: (value) => (
      <div className="space-y-1">
        {value?.map((participant, index) => (
          <div key={index} className="text-sm">
            {index + 1}. {participant.participantName}
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
    filterOptions: ['scheduled', 'in_progress', 'completed'],
    render: (value) => (
      <Badge
        variant={
          value === 'completed' ? 'secondary' :
            value === 'in_progress' ? 'default' :
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
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          handleViewDetails(row, 'fightSchedule')
        }}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
    )
  }
]

export const createViewOnlyMatchResultColumns = (formatCurrency, formatDate, handleViewDetails, eventType = 'regular') => [
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
  // {
  //   key: 'status',
  //   label: 'Status',
  //   sortable: true,
  //   filterable: true,
  //   filterOptions: ['Pending', 'Confirmed', 'Disputed', 'Final'],
  //   filterValueMap: {
  //     'Pending': 'pending',
  //     'Confirmed': 'confirmed',
  //     'Disputed': 'disputed',
  //     'Final': 'final'
  //   },
  //   render: (value, row) => (
  //     <div className="space-y-1">
  //       <Badge
  //         variant={
  //           value === 'final' ? 'default' :
  //             value === 'confirmed' ? 'secondary' :
  //               value === 'disputed' ? 'destructive' : 'outline'
  //         }
  //         className="text-xs capitalize"
  //       >
  //         {value}
  //       </Badge>
  //       {row.verified && (
  //         <div className="text-xs text-green-600">
  //           ✓ Verified
  //         </div>
  //       )}
  //     </div>
  //   )
  // },
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
