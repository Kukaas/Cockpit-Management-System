import PageLayout from '@/layouts/PageLayout'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, Users, TrendingUp, Filter, Trophy, Target, Clock, Award } from 'lucide-react'
import { useGetAll } from '@/hooks/useApiQueries'
import NativeSelect from '@/components/custom/NativeSelect'

import { EventChart } from './components/EventChart'

const EventDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedVenue, setSelectedVenue] = useState('')

  // Fetch data
  const { data: eventsData } = useGetAll('/events?status=active')
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  // Reset filters
  const resetFilters = () => {
    setSelectedMonth(new Date().getMonth())
    setSelectedYear(new Date().getFullYear())
    setSelectedVenue('')
  }

  return (
    <PageLayout
      title="Event Staff Dashboard"
      description="Manage fight schedules, match results, and track plazada earnings"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fights</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFights}</div>
              <p className="text-xs text-muted-foreground">
                {stats.scheduledFights} scheduled, {stats.inProgressFights} in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Fights</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedFights}</div>
              <p className="text-xs text-muted-foreground">
                {stats.verifiedResults} verified results
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plazada</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(stats.totalPlazada)}
              </div>
              <p className="text-xs text-muted-foreground">
                From {filteredMatchResults.length} matches
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bet Pool</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.totalBetPool)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total betting volume
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Match Results Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meron Wins</CardTitle>
              <Award className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.meronWins}</div>
              <p className="text-xs text-muted-foreground">
                {stats.meronWins > 0 ? Math.round((stats.meronWins / (stats.meronWins + stats.walaWins + stats.draws)) * 100) : 0}% of matches
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wala Wins</CardTitle>
              <Award className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.walaWins}</div>
              <p className="text-xs text-muted-foreground">
                {stats.walaWins > 0 ? Math.round((stats.walaWins / (stats.meronWins + stats.walaWins + stats.draws)) * 100) : 0}% of matches
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draws</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.draws}</div>
              <p className="text-xs text-muted-foreground">
                {stats.draws > 0 ? Math.round((stats.draws / (stats.meronWins + stats.walaWins + stats.draws)) * 100) : 0}% of matches
              </p>
            </CardContent>
          </Card>
        </div>

                 {/* Event Chart */}
         <EventChart
           matchResultsData={filteredMatchResults}
           fightSchedulesData={filteredFightSchedules}
         />
      </div>
    </PageLayout>
  )
}

export default EventDashboard
