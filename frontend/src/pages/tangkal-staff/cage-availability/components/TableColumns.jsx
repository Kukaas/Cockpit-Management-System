import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Shield, MapPin, Hash, Settings, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'

export const createCageAvailabilityColumns = (handleEditClick, handleDeleteClick) => [
  {
    key: 'cageNumber',
    label: 'Cage Number',
    sortable: true,
    filterable: false,
    render: (value) => (
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{value}</span>
      </div>
    )
  },
  // {
  //   key: 'arena',
  //   label: 'Arena',
  //   render: (value) => (
  //     <div className="flex items-center gap-2">
  //       <MapPin className="h-4 w-4 text-muted-foreground" />
  //       <span className="text-sm">{value}</span>
  //     </div>
  //   )
  // },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    filterable: true,
    filterOptions: ['Available', 'Rented'],
    filterValueMap: {
      'Available': 'active',
      'Rented': 'rented'
    },
    render: (value) => {
      // Helper function to get status icon
      const getStatusIcon = (status) => {
        switch (status) {
          case 'active':
            return <CheckCircle className="h-3 w-3" />
          case 'inactive':
            return <XCircle className="h-3 w-3" />
          case 'maintenance':
            return <AlertTriangle className="h-3 w-3" />
          case 'rented':
            return <Clock className="h-3 w-3" />
          default:
            return <Settings className="h-3 w-3" />
        }
      }

      // Helper function to get badge variant
      const getBadgeVariant = (status) => {
        switch (status) {
          case 'active':
            return 'default'
          case 'inactive':
            return 'destructive'
          case 'maintenance':
            return 'secondary'
          case 'rented':
            return 'outline'
          default:
            return 'outline'
        }
      }

      // Helper function to get display text
      const getStatusDisplayText = (status) => {
        switch (status) {
          case 'active':
            return 'Available'
          case 'rented':
            return 'Rented'
          default:
            return status
        }
      }

      return (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <Badge
            variant={getBadgeVariant(value)}
            className="text-xs capitalize"
          >
            {getStatusDisplayText(value)}
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
        >
          <Trash2 className="h-4 w-4" />
        </Button> */}
      </div>
    )
  }
]
