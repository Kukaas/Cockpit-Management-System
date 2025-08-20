import React from 'react'

export const createAdminEntranceColumns = (formatDate) => [
  {
    key: 'count',
    label: 'Number of Entrances',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="font-medium text-blue-600">
        {value} {value === 1 ? 'entrance' : 'entrances'}
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
