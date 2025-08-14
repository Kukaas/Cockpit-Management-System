import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, DollarSign, Users, Clock, ArrowLeft, UserPlus } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { useGetAll } from '@/hooks/useApiQueries'
import DataTable from '@/components/custom/DataTable'

const EventSelection = () => {
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
      key: 'entryFee',
      label: 'Entry Fee',
      sortable: true,
      filterable: false,
      render: (value) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-blue-600" />
          <span>{formatCurrency(value)}</span>
        </div>
      )
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
          onClick={() => navigate(`/registration-staff/participant-registration/${row._id}`)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Register Participants
        </Button>
      )
    }
  ]

  const handleRowClick = (event) => {
    navigate(`/registration-staff/participant-registration/${event._id}`)
  }

  return (
    <PageLayout
      title="Select Event for Registration"
      description="Choose an event to register participants and manage cock profiles"
      headerButton={
        <Button variant="outline" onClick={() => navigate('/event-staff/events')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
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
            emptyMessage="No events available for registration"
            className="shadow-sm"
          />

    </PageLayout>
  )
}

export default EventSelection
