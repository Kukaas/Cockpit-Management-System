import PageLayout from '@/layouts/PageLayout'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Target, Filter, Award, Activity } from 'lucide-react'
import { useGetAll } from '@/hooks/useApiQueries'
import NativeSelect from '@/components/custom/NativeSelect'
import { RegistrationChart } from './components/RegistrationChart'

const RegistrationDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedEvent, setSelectedEvent] = useState('')
  const [selectedVenue, setSelectedVenue] = useState('')

  // Fetch data with filters
  const { data: participantsData } = useGetAll('/participants')
  const { data: cockProfilesData } = useGetAll('/cock-profiles')
  const { data: eventsData } = useGetAll('/events?status=active')

  // Filter data based on selected filters
  const filteredParticipants = participantsData?.filter(participant => {
    const eventDate = new Date(participant.eventID?.date)
    const matchesMonth = eventDate.getMonth() === selectedMonth
    const matchesYear = eventDate.getFullYear() === selectedYear
    const matchesEvent = !selectedEvent || participant.eventID?._id === selectedEvent
    const matchesVenue = !selectedVenue || participant.eventID?.location === selectedVenue

    return matchesMonth && matchesYear && matchesEvent && matchesVenue
  }) || []

  const filteredCockProfiles = cockProfilesData?.filter(profile => {
    const eventDate = new Date(profile.eventID?.date)
    const matchesMonth = eventDate.getMonth() === selectedMonth
    const matchesYear = eventDate.getFullYear() === selectedYear
    const matchesEvent = !selectedEvent || profile.eventID?._id === selectedEvent
    const matchesVenue = !selectedVenue || profile.eventID?.location === selectedVenue

    return matchesMonth && matchesYear && matchesEvent && matchesVenue
  }) || []

  // Calculate filtered statistics
  const filteredStats = {
    totalParticipants: filteredParticipants.length,
    registeredParticipants: filteredParticipants.filter(p => p.status === 'registered').length,
    totalCockProfiles: filteredCockProfiles.length,
    activeCockProfiles: filteredCockProfiles.filter(c => c.isActive).length,
    inactiveCockProfiles: filteredCockProfiles.filter(c => !c.isActive).length,
    availableCockProfiles: filteredCockProfiles.filter(c => c.status === 'available' && c.isActive).length,
    foughtCockProfiles: filteredCockProfiles.filter(c => c.status === 'fought').length,
    scheduledCockProfiles: filteredCockProfiles.filter(c => c.status === 'scheduled').length,
    derbyEvents: filteredCockProfiles.filter(c => c.eventID?.eventType === 'derby').length,
    regularEvents: filteredCockProfiles.filter(c => c.eventID?.eventType === 'regular').length
  }

  // Get unique venues from events
  const venues = eventsData ? [...new Set(eventsData.map(event => event.location).filter(Boolean))] : []

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Reset filters
  const resetFilters = () => {
    setSelectedMonth(new Date().getMonth())
    setSelectedYear(new Date().getFullYear())
    setSelectedEvent('')
    setSelectedVenue('')
  }

  return (
    <PageLayout
      title="Registration Staff Dashboard"
      description="Manage participant registrations and cock profiles"
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
              Filter dashboard data by month, year, event, and venue
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
                <label className="text-sm font-medium">Event</label>
                <NativeSelect
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                >
                  <option value="">All Events</option>
                  {eventsData?.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.eventName} - {formatDate(event.date)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredStats.totalParticipants}</div>
              <p className="text-xs text-muted-foreground">
                {filteredStats.registeredParticipants} registered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cock Profiles</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{filteredStats.totalCockProfiles}</div>
              <p className="text-xs text-muted-foreground">
                {filteredStats.activeCockProfiles} active profiles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Cocks</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{filteredStats.availableCockProfiles}</div>
              <p className="text-xs text-muted-foreground">
                Ready for fights
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fought Cocks</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{filteredStats.foughtCockProfiles}</div>
              <p className="text-xs text-muted-foreground">
                Completed fights
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Chart */}
        <RegistrationChart
          participantsData={filteredParticipants}
          cockProfilesData={filteredCockProfiles}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </div>
    </PageLayout>
  )
}

export default RegistrationDashboard
