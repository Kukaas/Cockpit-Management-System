import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2 } from 'lucide-react'

export const createEntranceColumns = (formatCurrency, formatDate, handleEditClick, handleDeleteClick, isEventCompleted = false) => [
  {
    key: 'personName',
    label: 'Person Name',
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
    key: 'date',
    label: 'Date',
    sortable: true,
    filterable: false,
    render: (value) => formatDate(value)
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    filterable: true,
    filterOptions: ['paid', 'unpaid'],
    render: (value) => (
      <Badge
        variant={value === 'paid' ? 'default' : 'destructive'}
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
