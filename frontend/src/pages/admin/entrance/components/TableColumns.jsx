import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, User, Phone, Mail, Home, Eye } from 'lucide-react'

export const createAdminEntranceColumns = (formatCurrency, formatDate, handleViewDetails) => [
  {
    key: 'personName',
    label: 'Person Name',
    sortable: true,
    filterable: false,
    render: (value, row) => (
      <div className="flex flex-col max-w-[180px]">
        <span className="font-medium truncate" title={value}>{value}</span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Phone className="h-3 w-3 flex-shrink-0" />
          <span className="truncate" title={row.contactNumber}>{row.contactNumber}</span>
        </div>
      </div>
    )
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-1 max-w-[200px]">
        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm truncate" title={value}>{value}</span>
      </div>
    )
  },
  {
    key: 'address',
    label: 'Address',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-start gap-1 max-w-[250px]">
        <Home className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <span className="text-sm line-clamp-2" title={value}>{value}</span>
      </div>
    )
  },
  {
    key: 'entranceFee',
    label: 'Entrance Fee',
    sortable: true,
    filterable: false,
    render: (value) => (
      <span className="font-medium text-green-600">
        {formatCurrency(value)}
      </span>
    )
  },
  {
    key: 'date',
    label: 'Recorded Date',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{formatDate(value)}</span>
      </div>
    )
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
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          handleViewDetails(row)
        }}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
    )
  }
]
