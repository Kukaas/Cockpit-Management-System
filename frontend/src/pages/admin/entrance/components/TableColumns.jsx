import React from 'react'

export const createAdminEntranceColumns = (formatDate, formatCurrency) => [
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
  }
]
