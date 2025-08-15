import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Calendar, MapPin, DollarSign, Users } from 'lucide-react'

export const createEventColumns = (
  formatCurrency,
  formatDate,
  handleEditClick,
  handleDeleteClick,
  handleStatusChange,
  statusChangeMutation
) => [
  {
    key: 'eventName',
    label: 'Event Name',
    sortable: true,
    filterable: false,
    render: (value, row) => (
      <div className="flex flex-col">
        <span className="font-medium">{value}</span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {row.location}
        </span>
      </div>
    )
  },
  {
    key: 'date',
    label: 'Date & Time',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span>{formatDate(value)}</span>
      </div>
    )
  },
  {
    key: 'eventType',
    label: 'Type',
    sortable: true,
    filterable: true,
    filterOptions: ['Regular', 'Special', 'Championship', 'Exhibition'],
    filterValueMap: {
      'Regular': 'regular',
      'Special': 'special',
      'Championship': 'championship',
      'Exhibition': 'exhibition'
    },
    render: (value) => (
      <Badge
        variant={
          value === 'championship' ? 'destructive' :
          value === 'special' ? 'default' :
          value === 'exhibition' ? 'secondary' : 'outline'
        }
        className="text-xs capitalize"
      >
        {value}
      </Badge>
    )
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    filterable: true,
    filterOptions: ['Active', 'Completed', 'Cancelled'],
    filterValueMap: {
      'Active': 'active',
      'Completed': 'completed',
      'Cancelled': 'cancelled'
    },
    render: (value, row) => {
      // Show badge for completed/cancelled status (not editable)
      if (value === 'completed' || value === 'cancelled') {
        return (
          <Badge
            variant={
              value === 'completed' ? 'secondary' : 'destructive'
            }
            className="text-xs capitalize"
          >
            {value}
          </Badge>
        )
      }

      // Show select for active status (editable)
      return (
        <div className="space-y-1">
          <select
            value={value}
            onChange={(e) => handleStatusChange(row._id, e.target.value, value)}
            className="text-xs border rounded px-2 py-1 min-w-[90px] capitalize"
            disabled={statusChangeMutation.isPending}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )
    }
  },
  {
    key: 'prize',
    label: 'Prize Pool',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-1">
        <DollarSign className="h-4 w-4 text-green-600" />
        <span className="font-medium">{formatCurrency(value)}</span>
      </div>
    )
  },
  {
    key: 'entryFee',
    label: 'Entry Fee',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-1">
        <DollarSign className="h-4 w-4 text-blue-600" />
        <span>{formatCurrency(value)}</span>
      </div>
    )
  },
  {
    key: 'noCockRequirements',
    label: 'Cock Requirements',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-1">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span>{value}</span>
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
            handleDeleteClick(row)
          }}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }
]
