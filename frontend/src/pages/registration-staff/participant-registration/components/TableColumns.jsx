import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, User, Phone, Feather, Hash, Scale, Eye } from 'lucide-react'

export const createParticipantColumns = (handleEditClick, handleDeleteClick, handleViewDetails, isEventCompleted = false) => [
  {
    key: 'participantName',
    label: 'Participant Name',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{value}</span>
      </div>
    )
  },
  {
    key: 'contactNumber',
    label: 'Contact Number',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-muted-foreground" />
        <span>{value}</span>
      </div>
    )
  },

  {
    key: 'status',
    label: 'Status',
    sortable: true,
    filterable: true,
    filterOptions: ['registered', 'confirmed', 'withdrawn', 'disqualified'],
    render: (value) => (
      <div className="flex items-center gap-2">
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
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleEditClick(row)
          }}
          className="h-8 w-8 p-0"
          disabled={isEventCompleted}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleDeleteClick(row)
          }}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          disabled={isEventCompleted}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }
]

export const createCockProfileColumns = (handleEditClick, handleDeleteClick, handleViewDetails, isEventCompleted = false, eventType = 'regular') => [
  {
    key: 'entryNo',
    label: 'Entry No.',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono text-sm">#{value}</span>
      </div>
    )
  },
  {
    key: 'participantID',
    label: 'Participant',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span>{value?.participantName || 'N/A'}</span>
      </div>
    )
  },
  // Only include legband and weight columns for derby events
  ...(eventType === 'derby' ? [
    {
      key: 'legband',
      label: 'Legband',
      sortable: true,
      filterable: false,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Feather className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'weight',
      label: 'Weight',
      sortable: true,
      filterable: false,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value ? `${value} kg` : 'N/A'}</span>
        </div>
      )
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
      <div className="flex items-center gap-2">
        <Badge
          variant={value ? 'default' : 'secondary'}
          className="text-xs"
        >
          {value ? 'Active' : 'Inactive'}
        </Badge>
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
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleEditClick(row)
          }}
          className="h-8 w-8 p-0"
          disabled={isEventCompleted}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleDeleteClick(row)
          }}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          disabled={isEventCompleted}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }
]
