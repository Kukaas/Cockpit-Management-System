import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, User, Phone, Mail, DollarSign, Feather, Hash, Scale, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'

export const createParticipantColumns = (formatCurrency, handleEditClick, handleDeleteClick, isEventCompleted = false) => [
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
    key: 'email',
    label: 'Email',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{value}</span>
      </div>
    )
  },
  {
    key: 'entryFee',
    label: 'Entry Fee',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-green-600" />
        <span className="font-medium">{formatCurrency(value)}</span>
      </div>
    )
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    filterable: true,
    filterOptions: ['registered', 'confirmed', 'withdrawn', 'disqualified'],
    render: (value) => {
      // Helper function to get status icon
      const getStatusIcon = (status) => {
        switch (status) {
          case 'confirmed':
            return <CheckCircle className="h-3 w-3" />
          case 'withdrawn':
            return <XCircle className="h-3 w-3" />
          case 'disqualified':
            return <AlertCircle className="h-3 w-3" />
          case 'registered':
          default:
            return <Clock className="h-3 w-3" />
        }
      }

      return (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
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
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-2">
        <Feather className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{value}</span>
      </div>
    )
  },
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
    key: 'ownerName',
    label: 'Owner Name',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span>{value}</span>
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
        <span className="font-medium">{value} kg</span>
      </div>
    )
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
      <div className="flex items-center gap-2">
        {value ? (
          <CheckCircle className="h-3 w-3 text-green-600" />
        ) : (
          <XCircle className="h-3 w-3 text-red-600" />
        )}
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
