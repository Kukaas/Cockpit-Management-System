import PageLayout from '@/layouts/PageLayout'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, Users, TrendingUp, Filter, Ticket } from 'lucide-react'
import { useGetAll } from '@/hooks/useApiQueries'
import NativeSelect from '@/components/custom/NativeSelect'

import { EntranceChart } from './components/EntranceChart'

const EntranceDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedVenue, setSelectedVenue] = useState('')

  // Fetch data with filters
  const { data: entranceData } = useGetAll('/entrances')
  const { data: eventsData } = useGetAll('/events?status=active')

  // Filter data based on selected filters
  const filteredEntrances = entranceData?.filter(entrance => {
    const entranceDate = new Date(entrance.date)
    const matchesMonth = entranceDate.getMonth() === selectedMonth
    const matchesYear = entranceDate.getFullYear() === selectedYear
    const matchesVenue = !selectedVenue || entrance.eventID?.location === selectedVenue

    return matchesMonth && matchesYear && matchesVenue
  }) || []

  // Calculate filtered statistics
  const filteredStats = {
    totalTallyRecords: filteredEntrances.length,
    totalEntrances: filteredEntrances.reduce((sum, entrance) => sum + (entrance.count || 0), 0),
    totalRevenue: filteredEntrances.reduce((sum, entrance) => sum + ((entrance.count || 0) * (entrance.eventID?.entranceFee || 0)), 0), // Use dynamic entrance fee
    averageEntrancesPerRecord: filteredEntrances.length > 0
      ? Math.round(filteredEntrances.reduce((sum, entrance) => sum + (entrance.count || 0), 0) / filteredEntrances.length)
      : 0
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
      title="Entrance Staff Dashboard"
      description="Manage entrance tallies and attendance tracking"
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
              <CardTitle className="text-sm font-medium">Total Tally Records</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredStats.totalTallyRecords}</div>
              <p className="text-xs text-muted-foreground">
                Entrance tally records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entrances</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{filteredStats.totalEntrances}</div>
              <p className="text-xs text-muted-foreground">
                Total people entered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(filteredStats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                From entrance fees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Per Record</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{filteredStats.averageEntrancesPerRecord}</div>
              <p className="text-xs text-muted-foreground">
                Average entrances per tally
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Entrance Chart */}
        <EntranceChart
          entranceData={filteredEntrances}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </div>
    </PageLayout>
  )
}

export default EntranceDashboard
