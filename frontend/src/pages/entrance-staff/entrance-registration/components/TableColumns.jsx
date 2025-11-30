import React from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'

export const createEntranceColumns = (formatDate, formatCurrency, handleEditClick, handleDeleteClick, isEventDisabled = false) => [
  {
    key: 'count',
    label: 'Number of Entrances',
    sortable: true,
    filterable: false,
    render: (value, row) => (
      <div className="font-medium text-blue-600">
        {value} {value === 1 ? 'entrance' : 'entrances'}
        <div className="text-xs text-muted-foreground">
          {formatCurrency((row.eventID?.entranceFee || 0) * value)} total
        </div>
      </div>
    )
  },
  {
    key: 'date',
    label: 'Date Recorded',
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
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleEditClick(row)
          }}
          className="h-8 w-8 p-0"
          disabled={isEventDisabled}
        >
          <Edit className="h-4 w-4" />
        </Button>
        {/* <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleDeleteClick(row)
          }}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          disabled={isEventDisabled}
        >
          <Trash2 className="h-4 w-4" />
        </Button> */}
      </div>
    )
  }
]
