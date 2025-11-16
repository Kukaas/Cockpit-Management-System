import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Clock, ArrowLeft, UserPlus, Building, Filter, TrendingUp, DollarSign, Activity } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { useGetAll } from '@/hooks/useApiQueries'
import DataTable from '@/components/custom/DataTable'
import NativeSelect from '@/components/custom/NativeSelect'
import { EventChart } from './components/EventChart'

const EventSelection = () => {
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedVenue, setSelectedVenue] = useState('')
  const [selectedEventType, setSelectedEventType] = useState('')

  // Fetch events
  const { data: events = [], isLoading } = useGetAll('/events')

  // Filter data based on selected filters
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    const matchesMonth = eventDate.getMonth() === selectedMonth
    const matchesYear = eventDate.getFullYear() === selectedYear
    const matchesVenue = !selectedVenue || event.location === selectedVenue
    const matchesEventType = !selectedEventType || event.eventType === selectedEventType

    return matchesMonth && matchesYear && matchesVenue && matchesEventType
  })

  // Calculate filtered statistics
  const filteredStats = {
    totalEvents: filteredEvents.length,
    activeEvents: filteredEvents.filter(event => event.status === 'active').length,
    completedEvents: filteredEvents.filter(event => event.status === 'completed').length,
    cancelledEvents: filteredEvents.filter(event => event.status === 'cancelled').length,
    totalCapacity: filteredEvents.reduce((sum, event) => sum + (event.maxCapacity || 0), 0),
    averageCapacity: filteredEvents.length > 0
      ? Math.round(filteredEvents.reduce((sum, event) => sum + (event.maxCapacity || 0), 0) / filteredEvents.length)
      : 0
  }

  // Get unique venues and event types from events
  const venues = [...new Set(events.map(event => event.location).filter(Boolean))]
  const eventTypes = [...new Set(events.map(event => event.eventType).filter(Boolean))]

  // Month options
  const months = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ]

  // Year options (current year and 2 years back)
  const currentYear = new Date().getFullYear()
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]

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

  // Reset filters
  const resetFilters = () => {
    setSelectedMonth(new Date().getMonth())
    setSelectedYear(new Date().getFullYear())
    setSelectedVenue('')
    setSelectedEventType('')
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
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/admin/entrance/${row._id}`)}
          className="flex items-center gap-2"
          disabled={row.status === 'completed' || row.status === 'cancelled'}
        >
          <UserPlus className="h-4 w-4" />
          View Entrances
        </Button>
      )
    }
  ]

  const handleRowClick = (event) => {
    // Allow navigation even if event date has passed - only button is disabled
    navigate(`/admin/entrance/${event._id}`)
  }

  return (
    <PageLayout
      title="Select Event for Entrance Records"
      description="Choose an event to view and manage entrance tally records"
    >
      <div className="space-y-6">
        {/* Filters Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <CardTitle className="text-lg">Event Filters</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
            <CardDescription>
              Filter events by month, year, venue, and event type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <NativeSelect
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <NativeSelect
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Venue</label>
                <NativeSelect
                  value={selectedVenue}
                  onChange={(e) => setSelectedVenue(e.target.value)}
                >
                  <option value="">All Venues</option>
                  {venues.map((venue) => (
                    <option key={venue} value={venue}>
                      {venue}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Event Type</label>
                <NativeSelect
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredStats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                Events in selected period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{filteredStats.activeEvents}</div>
              <p className="text-xs text-muted-foreground">
                Currently active events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{filteredStats.totalCapacity}</div>
              <p className="text-xs text-muted-foreground">
                Combined max capacity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Capacity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{filteredStats.averageCapacity}</div>
              <p className="text-xs text-muted-foreground">
                Average per event
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Event Chart */}
        <EventChart
          eventsData={filteredEvents}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Events</CardTitle>
            <CardDescription>
              Showing {filteredEvents.length} events for {months[selectedMonth].label} {selectedYear}
              {selectedVenue && ` - ${selectedVenue}`}
              {selectedEventType && ` - ${selectedEventType.charAt(0).toUpperCase() + selectedEventType.slice(1)}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredEvents}
              columns={columns}
              pageSize={10}
              searchable={true}
              filterable={true}
              title="Events"
              onRowClick={handleRowClick}
              loading={isLoading}
              emptyMessage="No events available for entrance tally"
              className="shadow-sm"
              filterOnlyColumns={[
                {
                  key: 'location',
                  label: 'Venue'
                }
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}

export default EventSelection
