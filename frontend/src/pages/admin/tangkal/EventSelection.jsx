import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, MapPin, Users, Award } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { useGetAll } from '@/hooks/useApiQueries'
import DataTable from '@/components/custom/DataTable'

const EventSelection = () => {
  const navigate = useNavigate()

  // Fetch events
  const { data: events = [], isLoading } = useGetAll('/events')

  // Format functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  // Handle row click to navigate to event rentals
  const handleRowClick = (event) => {
    navigate(`/admin/tangkal/rentals/${event._id}`)
  }

  // Create table columns
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
      render: (value) => {
        const getEventTypeIcon = (eventType) => {
          switch (eventType) {
            case 'derby':
              return <Award className="h-3 w-3" />
            case 'regular':
            default:
              return <Calendar className="h-3 w-3" />
          }
        }

        return (
          <div className="flex items-center gap-2">
            {getEventTypeIcon(value)}
            <span className="text-xs capitalize">{value}</span>
          </div>
        )
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Active', 'Completed', 'Cancelled'],
      filterValueMap: {
        'Active': 'active',
        'Completed': 'completed',
        'Cancelled': 'cancelled'
      },
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'active' ? 'bg-green-100 text-green-800' :
          value === 'completed' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'eventSpecificInfo',
      label: 'Event Details',
      sortable: false,
      filterable: false,
      render: (_, row) => {
        if (row.eventType === 'regular') {
          return (
            <div className="text-xs text-muted-foreground">
              <div>Standard Event</div>
              <div>No special requirements</div>
            </div>
          )
        } else {
          return (
            <div className="space-y-1">
              {row.prize && (
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium">{formatCurrency(row.prize)}</span>
                </div>
              )}
              {row.maxParticipants && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">Max: {row.maxParticipants} participants</span>
                </div>
              )}
            </div>
          )
        }
      }
    }
  ]

  return (
    <PageLayout
      title="Select Event for Rentals"
      description="Choose an event to view its cage rentals"
      headerButton={
        <Button variant="outline" onClick={() => navigate('/admin')}>
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
        emptyMessage="No events found"
        className="shadow-sm"
      />
    </PageLayout>
  )
}

export default EventSelection
