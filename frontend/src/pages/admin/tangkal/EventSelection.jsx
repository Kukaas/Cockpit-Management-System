import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, MapPin, Users, Award, DollarSign, Home, TrendingUp, Activity, Filter } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { useGetAll } from '@/hooks/useApiQueries'
import DataTable from '@/components/custom/DataTable'
import NativeSelect from '@/components/custom/NativeSelect'
import { RentalChart } from '@/pages/tangkal-staff/rentals/components/RentalChart'

const EventSelection = () => {
  const navigate = useNavigate()

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedEventType, setSelectedEventType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  // Fetch events and rentals
  const { data: events = [], isLoading } = useGetAll('/events')
  const { data: allRentals = [] } = useGetAll('/cage-rentals')

  // Months array for filter
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

  // Filter events based on selected filters
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    const matchesMonth = eventDate.getMonth() === selectedMonth
    const matchesYear = eventDate.getFullYear() === selectedYear
    const matchesEventType = !selectedEventType || event.eventType === selectedEventType
    const matchesStatus = !selectedStatus || event.status === selectedStatus

    return matchesMonth && matchesYear && matchesEventType && matchesStatus
  })

  // Filter rentals based on selected filters
  const filteredRentals = allRentals.filter(rental => {
    const rentalDate = new Date(rental.date)
    const matchesMonth = rentalDate.getMonth() === selectedMonth
    const matchesYear = rentalDate.getFullYear() === selectedYear

    return matchesMonth && matchesYear
  })

  // Calculate filtered statistics
  const filteredStats = {
    totalEvents: filteredEvents.length,
    totalRentals: filteredRentals.length,
    totalRevenue: filteredRentals.reduce((sum, rental) => sum + (rental.totalPrice || 0), 0),
    paidRentals: filteredRentals.filter(rental => rental.paymentStatus === 'paid').length,
    unpaidRentals: filteredRentals.filter(rental => rental.paymentStatus === 'unpaid').length,
    activeRentals: filteredRentals.filter(rental => rental.rentalStatus === 'active').length,
    returnedRentals: filteredRentals.filter(rental => rental.rentalStatus === 'returned').length,
    totalCagesRented: filteredRentals.reduce((sum, rental) => sum + (rental.quantity || 0), 0),
    activeCagesRented: filteredRentals
      .filter(rental => rental.rentalStatus === 'active')
      .reduce((sum, rental) => sum + (rental.quantity || 0), 0)
  }

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

  // Reset filters
  const resetFilters = () => {
    setSelectedMonth(new Date().getMonth())
    setSelectedYear(new Date().getFullYear())
    setSelectedEventType('')
    setSelectedStatus('')
  }

  // Supported event types for filter and display
  const eventTypes = ['regular', 'derby', 'hits_ulutan', 'fastest_kill']

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
      filterOptions: ['Regular', 'Derby', 'Fastest Kill', 'Hits Ulutan'],
      filterValueMap: {
        'Regular': 'regular',
        'Derby': 'derby',
        'Fastest Kill': 'fastest_kill',
        'Hits Ulutan': 'hits_ulutan'
      },
      render: (value) => (
        <Badge
          variant={
            value === 'derby' ? 'default' : 'outline'
          }
          className="text-xs capitalize"
        >
          {value === 'hits_ulutan' ? 'Hits Ulutan' : value === 'fastest_kill' ? 'Fastest Kill' : value}
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
              value === 'completed' ? 'secondary'
                : 'outline'
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
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
          <CardDescription>
            Filter events and rentals by month, year, event type, and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>
                    {year}
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
                    {type === 'hits_ulutan'
                      ? 'Hits Ulutan'
                      : type === 'fastest_kill'
                        ? 'Fastest Kill'
                        : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <NativeSelect
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </NativeSelect>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={resetFilters} className="w-full">
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(filteredStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From all rentals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rental Chart */}
      <RentalChart
        rentalsData={filteredRentals}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      {/* Events Table */}
      <DataTable
        data={filteredEvents}
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
