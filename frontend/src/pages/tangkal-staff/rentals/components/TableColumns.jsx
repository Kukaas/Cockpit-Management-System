import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, DollarSign, RotateCcw } from 'lucide-react'

export const createRentalColumns = (formatCurrency, formatDate, handleEditClick, handleDeleteClick, handleStatusChange, statusChangeMutation, handleRentalStatusChange, rentalStatusMutation) => [
  {
    key: 'cageNo',
    label: 'Cage Number',
    sortable: true,
    filterable: false,
    render: (value) => {
      // Handle populated cage data
      if (value && typeof value === 'object' && value.cageNumber) {
        return value.cageNumber
      }
      // Handle string value (fallback)
      return value || '-'
    }
  },
  {
    key: 'nameOfRenter',
    label: 'Renter Name',
    sortable: true,
    filterable: false
  },
  {
    key: 'price',
    label: 'Price',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-1">
        <DollarSign className="h-4 w-4 text-green-600" />
        <span>{formatCurrency(value)}</span>
      </div>
    )
  },
  {
    key: 'date',
    label: 'Rental Date',
    sortable: true,
    filterable: false,
    render: (value) => formatDate(value)
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
      'Unpaid': 'unpaid'
    },
    render: (value, row) => {
      // Show badge for paid status (not editable)
      if (value === 'paid') {
        return (
          <Badge
            variant="default"
            className="text-xs capitalize"
          >
            {value}
          </Badge>
        )
      }

      // Show button to mark as paid for unpaid status
      return (
        <div className="space-y-1">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleStatusChange(row._id, 'paid', value)
            }}
            disabled={statusChangeMutation.isPending}
            className="text-xs h-7 px-2"
          >
            Mark as Paid
          </Button>
        </div>
      )
    }
  },
  {
    key: 'rentalStatus',
    label: 'Rental Status',
    sortable: true,
    filterable: true,
    filterOptions: ['Active', 'Returned'],
    filterValueMap: {
      'Active': 'active',
      'Returned': 'returned'
    },
    render: (value) => {
      // Show badge for returned status
      if (value === 'returned') {
        return (
          <Badge
            variant="secondary"
            className="text-xs capitalize"
          >
            {value}
          </Badge>
        )
      }

      // Show badge for active status
      return (
        <Badge
          variant="default"
          className="text-xs capitalize"
        >
          {value}
        </Badge>
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
          disabled={row.rentalStatus === 'returned'}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
        {row.rentalStatus === 'active' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleRentalStatusChange(row._id, 'returned', row.rentalStatus)
            }}
            disabled={rentalStatusMutation.isPending || row.paymenStatus === 'unpaid'}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
            title="Mark as Returned"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleDeleteClick(row)
          }}
          disabled={row.rentalStatus === 'returned'}
          className={`h-8 w-8 p-0 ${
            row.rentalStatus === 'returned'
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-red-600 hover:text-red-700'
          }`}
          title={row.rentalStatus === 'returned' ? 'Cannot delete returned rentals' : 'Delete rental'}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }
]
