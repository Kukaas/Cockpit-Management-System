import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, RotateCcw, Eye } from 'lucide-react'

export const createRentalColumns = (formatCurrency, formatDate, handleEditClick, handleDeleteClick, handleStatusChange, statusChangeMutation, handleOpenReturnDialog, rentalStatusMutation, handleViewDetails) => [
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

      // Show button to mark as paid for unpaid/pending status
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
  // {
  //   key: 'rentalStatus',
  //   label: 'Rental Status',
  //   sortable: true,
  //   filterable: true,
  //   filterOptions: ['Active', 'Returned'],
  //   filterValueMap: {
  //     'Active': 'active',
  //     'Returned': 'returned'
  //   },
  //   render: (value) => {
  //     // Show badge for returned status
  //     if (value === 'returned') {
  //       return (
  //         <Badge
  //           variant="secondary"
  //           className="text-xs capitalize"
  //         >
  //           {value}
  //         </Badge>
  //       )
  //     }

  //     // Show badge for active status
  //     return (
  //       <Badge
  //         variant="default"
  //         className="text-xs capitalize"
  //       >
  //         {value}
  //       </Badge>
  //     )
  //   }
  // },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
    filterable: false,
    render: (_, row) => {
      const isReturned = row.rentalStatus === 'returned'

      return (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleViewDetails(row)
            }}
            className="h-8 w-8 p-0"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.rentalStatus === 'active' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenReturnDialog(row)
              }}
              disabled={rentalStatusMutation.isPending || row.paymentStatus === 'unpaid'}
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
              title={row.quantity > 1 ? 'Return Cages' : 'Mark as Returned'}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleEditClick(row)
            }}
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
            disabled={isReturned}
            className={`h-8 w-8 p-0 ${isReturned
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-red-600 hover:text-red-700'
              }`}
            title={isReturned ? 'Cannot delete returned rentals' : 'Delete rental'}
          >
            <Trash2 className="h-4 w-4" />
          </Button> */}
        </div>
      )
    }
  }
]
