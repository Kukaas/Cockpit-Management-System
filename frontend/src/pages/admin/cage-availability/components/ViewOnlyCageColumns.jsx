import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Shield, MapPin, Hash, Settings, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'

export const createViewOnlyCageColumns = () => [
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
  {
    key: 'arena',
    label: 'Arena',
    sortable: true,
    filterable: true,
    filterOptions: ['Buenavista Cockpit Arena', 'Mogpog Cockpit Arena', 'Boac Cockpit Arena'],
    render: (value) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{value}</span>
      </div>
    )
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    filterable: true,
    filterOptions: ['Active', 'Rented'],
    filterValueMap: {
      'Active': 'active',
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

      return (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <Badge
            variant={getBadgeVariant(value)}
            className="text-xs capitalize"
          >
            {value}
          </Badge>
        </div>
      )
    }
  },
]
