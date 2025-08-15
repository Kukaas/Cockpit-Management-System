import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2 } from 'lucide-react'

export const createParticipantColumns = (formatCurrency, handleEditClick, handleDeleteClick, isEventCompleted = false) => [
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
      <div className="flex items-center space-x-2">
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

export const createCockProfileColumns = (handleEditClick, handleDeleteClick, isEventCompleted = false) => [
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
      <div className="flex items-center space-x-2">
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
