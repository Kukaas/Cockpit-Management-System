import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Calendar, MapPin, DollarSign, Users, Award, Target, Info, Building } from 'lucide-react'

export const createEventColumns = (
  formatCurrency,
  formatDate,
  handleEditEventClick,
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
    filterOptions: ['Regular', 'Derby'],
    filterValueMap: {
      'Regular': 'regular',
      'Derby': 'derby'
    },
    render: (value) => {
      // Helper function to get event type icon
      const getEventTypeIcon = (eventType) => {
        switch (eventType) {
          case 'derby':
            return <Award className="h-3 w-3" />
          case 'regular':
          default:
            return <Calendar className="h-3 w-3" />
        }
      }

      return (
        <div className="flex items-center gap-2">
          {getEventTypeIcon(value)}
          <Badge
            variant={
              value === 'derby' ? 'default' : 'outline'
            }
            className="text-xs capitalize"
          >
            {value}
          </Badge>
        </div>
      )
    }
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
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
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
    key: 'maxCapacity',
    label: 'Max Capacity',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-1">
        <Building className="h-4 w-4 text-blue-600" />
        <span>{value}</span>
      </div>
    )
  },
  {
    key: 'eventSpecificInfo',
    label: 'Event Details',
    sortable: false,
    filterable: false,
    render: (_, row) => {
      // Display different information based on event type
      if (row.eventType === 'regular') {
        // For regular events, show basic info
        return (
          <div className="text-xs text-muted-foreground">
            <div>Standard Event</div>
            <div>No special requirements</div>
          </div>
        )
      } else {
        // For derby events, show prize and cock requirements
        return (
          <div className="space-y-1">
            {row.prize && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium">{formatCurrency(row.prize)}</span>
              </div>
            )}
            {row.noCockRequirements && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">{row.noCockRequirements} cocks</span>
              </div>
            )}
            {row.maxParticipants && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-blue-600" />
                <span className="text-xs">Max: {row.maxParticipants} participants</span>
              </div>
            )}
          </div>
        )
      }
    }
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
            handleEditEventClick(row)
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
