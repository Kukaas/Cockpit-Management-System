import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, MapPin,  Users, ArrowLeft, Swords, Filter, Trophy, Target, Clock, Award, TrendingUp } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { useGetAll } from '@/hooks/useApiQueries'
import DataTable from '@/components/custom/DataTable'
import NativeSelect from '@/components/custom/NativeSelect'

import { EventChart } from './components/EventChart'

const AdminEventSelection = () => {
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedVenue, setSelectedVenue] = useState('')

  // Fetch events
  const { data: events = [], isLoading } = useGetAll('/events')
  const { data: fightSchedulesData } = useGetAll('/fight-schedules')
  const { data: matchResultsData } = useGetAll('/match-results')

  // Filter data based on selected filters
  const filteredFightSchedules = fightSchedulesData?.filter(schedule => {
    const eventDate = new Date(schedule.eventID?.date)
    const matchesMonth = eventDate.getMonth() === selectedMonth
    const matchesYear = eventDate.getFullYear() === selectedYear
    const matchesVenue = !selectedVenue || schedule.eventID?.location === selectedVenue
    return matchesMonth && matchesYear && matchesVenue
  }) || []

  const filteredMatchResults = matchResultsData?.filter(result => {
    const eventDate = new Date(result.matchID?.eventID?.date)
    const matchesMonth = eventDate.getMonth() === selectedMonth
    const matchesYear = eventDate.getFullYear() === selectedYear
    const matchesVenue = !selectedVenue || result.matchID?.eventID?.location === selectedVenue
    return matchesMonth && matchesYear && matchesVenue
  }) || []

  // Calculate statistics
  const stats = {
    totalFights: filteredFightSchedules.length,
    completedFights: filteredFightSchedules.filter(f => f.status === 'completed').length,
    inProgressFights: filteredFightSchedules.filter(f => f.status === 'in_progress').length,
    scheduledFights: filteredFightSchedules.filter(f => f.status === 'scheduled').length,
    totalPlazada: filteredMatchResults.reduce((sum, result) => sum + (result.totalPlazada || 0), 0),
    totalBetPool: filteredMatchResults.reduce((sum, result) => sum + (result.totalBetPool || 0), 0),
    meronWins: filteredMatchResults.filter(r => r.betWinner === 'Meron').length,
    walaWins: filteredMatchResults.filter(r => r.betWinner === 'Wala').length,
    draws: filteredMatchResults.filter(r => r.betWinner === 'Draw').length,
    verifiedResults: filteredMatchResults.filter(r => r.verified).length,
    pendingResults: filteredMatchResults.filter(r => !r.verified).length
  }

  // Get unique venues from events
  const venues = events ? [...new Set(events.map(event => event.location).filter(Boolean))] : []

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

  // Reset filters
  const resetFilters = () => {
    setSelectedMonth(new Date().getMonth())
    setSelectedYear(new Date().getFullYear())
    setSelectedVenue('')
  }

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
      filterOptions: ['Active', 'Completed'],
      filterValueMap: {
        'Active': 'active',
        'Completed': 'completed',
      },
      render: (value) => (
        <Badge
          variant={
            value === 'active' ? 'default' :
              value === 'completed' ? 'secondary' :
                'outline'
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
                <div className="flex items-center gap-1"> <span className="text-xs font-medium">{formatCurrency(row.prize)}</span>
                </div>
              )}
              {row.noCockRequirements && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">{row.noCockRequirements} cocks</span>
                </div>
              )}
              {row.minimumBet && (
                <div className="flex items-center gap-1"> <span className="text-xs">Min: {formatCurrency(row.minimumBet)}</span>
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
          onClick={() => navigate(`/admin/fight-schedule/${row._id}`)}
          className="flex items-center gap-2"
        >
          <Swords className="h-4 w-4" />
          View Fights
        </Button>
      )
    }
  ]

  const handleRowClick = (event) => {
    navigate(`/admin/fight-schedule/${event._id}`)
  }

  return (
    <PageLayout
      title="Fight Schedule Overview"
      description="Select an event to view fight schedules and match results"
      headerButton={
        <Button variant="outline" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <CardTitle className="text-lg">Dashboard Filters</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
            <CardDescription>
              Filter dashboard data by month, year, and venue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plazada</CardTitle> </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(stats.totalPlazada)}
              </div>
              <p className="text-xs text-muted-foreground">
                From {filteredMatchResults.length} matches
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Event Chart */}
        <EventChart
          matchResultsData={filteredMatchResults}
          fightSchedulesData={filteredFightSchedules}
          eventType="regular"
        />

        {/* Events Table */}

        <DataTable
          data={events}
          columns={columns}
          pageSize={10}
          searchable={true}
          filterable={true}
          title="Events"
          onRowClick={handleRowClick}
          loading={isLoading}
          emptyMessage="No events available"
          className="shadow-sm"
        />

      </div>
    </PageLayout>
  )
}

export default AdminEventSelection
