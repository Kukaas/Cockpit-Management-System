import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Clock, ArrowLeft, UserPlus, Building } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { useGetAll } from '@/hooks/useApiQueries'
import DataTable from '@/components/custom/DataTable'

const EventSelection = () => {
  const navigate = useNavigate()

  // Fetch events
  const { data: events = [], isLoading } = useGetAll('/events')

  // Filter to only show active events
  const activeEvents = events.filter(event => event.status === 'active')

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
      filterOptions: ['Regular', 'Derby'],
      filterValueMap: {
        'Regular': 'regular',
        'Derby': 'derby'
      },
      render: (value) => (
        <Badge
          variant={
            value === 'derby' ? 'default' : 'outline'
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
      key: 'maxCapacity',
      label: 'Max Capacity',
      sortable: true,
      filterable: false,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Building className="h-4 w-4 text-blue-600" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      filterable: false,
      render: (_, row) => {
        const eventDate = new Date(row.date)
        const isEventDatePassed = eventDate < new Date()
        const isDisabled = row.status === 'completed' || row.status === 'cancelled' || isEventDatePassed

        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/entrance-staff/entrance-registration/${row._id}`)}
            className="flex items-center gap-2"
            disabled={isDisabled}
          >
            <UserPlus className="h-4 w-4" />
            Record Entrances
          </Button>
        )
      }
    }
  ]

  const handleRowClick = (event) => {
    // Allow navigation even if event date has passed - only button is disabled
    navigate(`/entrance-staff/entrance-registration/${event._id}`)
  }

  return (
    <PageLayout
      title="Select Event for Entrance Records"
      description="Choose an event to record entrance tallies and manage entrance records"
    >
      <DataTable
        data={activeEvents}
        columns={columns}
        pageSize={10}
        searchable={true}
        filterable={false}
        title="Events"
        onRowClick={handleRowClick}
        loading={isLoading}
        emptyMessage="No events available for entrance tally"
        className="shadow-sm"
      />
    </PageLayout>
  )
}

export default EventSelection
