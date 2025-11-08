import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, DollarSign, Users, ArrowLeft, Swords } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { useGetAll } from '@/hooks/useApiQueries'
import DataTable from '@/components/custom/DataTable'

const StaffEventSelection = () => {
  const navigate = useNavigate()

  // Fetch events
  const { data: events = [], isLoading } = useGetAll('/events')

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  // Column configuration
  const columns = [
    {
      key: 'eventName',
      label: 'Event Name',
      sortable: true,
      filterable: false,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium">{value}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {row.location}
          </span>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date & Time',
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
      key: 'eventType',
      label: 'Type',
      sortable: true,
      filterable: true,
      filterOptions: ['Regular', 'Special', 'Championship', 'Exhibition'],
      filterValueMap: {
        'Regular': 'regular',
        'Special': 'special',
        'Championship': 'championship',
        'Exhibition': 'exhibition'
      },
      render: (value) => (
        <Badge
          variant={
            value === 'championship' ? 'destructive' :
            value === 'special' ? 'default' :
            value === 'exhibition' ? 'secondary' : 'outline'
          }
          className="text-xs capitalize"
        >
          {value}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Active', 'Completed', 'Cancelled', 'Planned'],
      filterValueMap: {
        'Active': 'active',
        'Completed': 'completed',
        'Cancelled': 'cancelled',
        'Planned': 'planned'
      },
      render: (value) => (
        <Badge
          variant={
            value === 'active' ? 'default' :
            value === 'completed' ? 'secondary' :
            value === 'cancelled' ? 'destructive' : 'outline'
          }
          className="text-xs capitalize"
        >
          {value}
        </Badge>
      )
    },
    {
      key: 'eventSpecificInfo',
      label: 'Event Details',
      sortable: false,
      filterable: false,
      render: (_, row) => {
        // Display different information based on event type
        if (row.eventType === 'regular') {
          // For regular events, show basic info
          return (
            <div className="text-xs text-muted-foreground">
              <div>Standard Event</div>
              <div>No special requirements</div>
            </div>
          )
        } else {
          // For non-regular events, show prize and cock requirements
          return (
            <div className="space-y-1">
              {row.prize && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium">{formatCurrency(row.prize)}</span>
                </div>
              )}
              {row.noCockRequirements && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">{row.noCockRequirements} cocks</span>
                </div>
              )}
              {row.minimumBet && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-orange-600" />
                  <span className="text-xs">Min: {formatCurrency(row.minimumBet)}</span>
                </div>
              )}
            </div>
          )
        }
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      filterable: false,
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/bet-staff/fight-schedule/${row._id}`)}
          className="flex items-center gap-2"
          disabled={row.status === 'completed' || row.status === 'cancelled'}
        >
          <Swords className="h-4 w-4" />
          Manage Fights
        </Button>
      )
    }
  ]

  const handleRowClick = (event) => {
    navigate(`/bet-staff/fight-schedule/${event._id}`)
  }

  return (
    <PageLayout
      title="Fight Schedule Management"
      description="Select an event to manage fight schedules and match results"
      headerButton={
        <Button variant="outline" onClick={() => navigate('/bet-staff')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      }
    >
      <DataTable
        data={events}
        columns={columns}
        pageSize={10}
        searchable={true}
        filterable={true}
        title="Events"
        onRowClick={handleRowClick}
        loading={isLoading}
        emptyMessage="No events available for fight scheduling"
        className="shadow-sm"
        filterOnlyColumns={[
          {
            key: 'location',
            label: 'Venue'
          }
        ]}
      />
    </PageLayout>
  )
}

export default StaffEventSelection
