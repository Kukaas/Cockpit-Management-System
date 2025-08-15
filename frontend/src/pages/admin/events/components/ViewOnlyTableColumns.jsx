import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'

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
    key: 'email',
    label: 'Email',
    sortable: true,
    filterable: false
  },
  {
    key: 'entryFee',
    label: 'Entry Fee',
    sortable: true,
    filterable: false,
    render: (value) => formatCurrency(value)
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

export const createViewOnlyCockProfileColumns = (handleViewDetails) => [
  {
    key: 'legband',
    label: 'Legband',
    sortable: true,
    filterable: false
  },
  {
    key: 'entryNo',
    label: 'Entry No.',
    sortable: true,
    filterable: false
  },
  {
    key: 'ownerName',
    label: 'Owner Name',
    sortable: true,
    filterable: false
  },
  {
    key: 'weight',
    label: 'Weight (kg)',
    sortable: true,
    filterable: false,
    render: (value) => `${value} kg`
  },
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
    key: 'cockProfileID',
    label: 'Cock Profiles',
    sortable: false,
    filterable: false,
    render: (value) => (
      <div className="space-y-1">
        {value?.map((cock, index) => (
          <div key={index} className="text-sm">
            {index + 1}. {cock.legband} ({cock.ownerName})
          </div>
        ))}
      </div>
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
    key: 'status',
    label: 'Status',
    sortable: true,
    filterable: true,
    filterOptions: ['scheduled', 'in_progress', 'completed', 'cancelled'],
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
    key: 'scheduledTime',
    label: 'Scheduled Time',
    sortable: true,
    filterable: false,
    render: (value) => formatDate(value)
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
