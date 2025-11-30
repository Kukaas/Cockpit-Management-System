import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye,  Calendar, MapPin } from 'lucide-react'

export const createViewOnlyRentalColumns = (formatCurrency, formatDate, handleViewDetails) => [
  {
    key: 'nameOfRenter',
    label: 'Renter Name',
    sortable: true,
    filterable: false
  },
  {
    key: 'totalPrice',
    label: 'Total Price',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-1"> <span>{formatCurrency(value)}</span>
      </div>
    )
  },
  {
    key: 'date',
    label: 'Rental Date',
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
    key: 'arena',
    label: 'Arena',
    render: (value) => (
      <div className="flex items-center gap-1">
        <MapPin className="h-4 w-4 text-blue-600" />
        <span className="text-sm">{value}</span>
      </div>
    )
  },
  {
    key: 'quantity',
    label: 'Quantity',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="text-center">
        <span className="font-medium">{value}</span>
        <span className="text-xs text-muted-foreground block">cage{value > 1 ? 's' : ''}</span>
      </div>
    )
  },
  {
    key: 'contactNumber',
    label: 'Contact',
    sortable: true,
    filterable: false,
    render: (value) => value || '-'
  },
  {
    key: 'paymentStatus',
    label: 'Payment Status',
    sortable: true,
    filterable: true,
    filterOptions: ['Paid', 'Unpaid'],
    filterValueMap: {
      'Paid': 'paid',
      'Unpaid': 'unpaid',
    },
    render: (value) => (
      <Badge
        variant={
          value === 'paid' ? 'default' :
          value === 'unpaid' ? 'destructive' :
          value === 'pending' ? 'secondary' : 'outline'
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
