import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  Users,
  TrendingUp,
  Filter,
  Trophy,
  Target,
  Clock,
  Award,
  Calendar,
  MapPin,
  Swords,
  Building,
  Ticket,
  Home,
  ArrowRight,
  BarChart3,
  Activity
} from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { useGetAll } from '@/hooks/useApiQueries'
import NativeSelect from '@/components/custom/NativeSelect'
import { useNavigate } from 'react-router-dom'

// Import chart components
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedVenue, setSelectedVenue] = useState('')
  const [timeRange, setTimeRange] = useState("90d")

  // Fetch all data
  const { data: events = [] } = useGetAll('/events')
  const { data: fightSchedules = [] } = useGetAll('/fight-schedules')
  const { data: matchResults = [] } = useGetAll('/match-results')
  const { data: cageRentals = [] } = useGetAll('/cage-rentals')
  const { data: entrances = [] } = useGetAll('/entrances')

  // Filter data based on selected filters
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    const matchesMonth = eventDate.getMonth() === selectedMonth
    const matchesYear = eventDate.getFullYear() === selectedYear
    const matchesVenue = !selectedVenue || event.location === selectedVenue
    return matchesMonth && matchesYear && matchesVenue
  })

  const filteredFightSchedules = fightSchedules.filter(schedule => {
    const eventDate = new Date(schedule.eventID?.date)
    const matchesMonth = eventDate.getMonth() === selectedMonth
    const matchesYear = eventDate.getFullYear() === selectedYear
    const matchesVenue = !selectedVenue || schedule.eventID?.location === selectedVenue
    return matchesMonth && matchesYear && matchesVenue
  })

  const filteredMatchResults = matchResults.filter(result => {
    const eventDate = new Date(result.matchID?.eventID?.date)
    const matchesMonth = eventDate.getMonth() === selectedMonth
    const matchesYear = eventDate.getFullYear() === selectedYear
    const matchesVenue = !selectedVenue || result.matchID?.eventID?.location === selectedVenue
    return matchesMonth && matchesYear && matchesVenue
  })

  const filteredCageRentals = cageRentals.filter(rental => {
    const rentalDate = new Date(rental.date)
    const matchesMonth = rentalDate.getMonth() === selectedMonth
    const matchesYear = rentalDate.getFullYear() === selectedYear
    const matchesVenue = !selectedVenue || rental.arena === selectedVenue
    return matchesMonth && matchesYear && matchesVenue
  })

  const filteredEntrances = entrances.filter(entrance => {
    const entranceDate = new Date(entrance.createdAt)
    const matchesMonth = entranceDate.getMonth() === selectedMonth
    const matchesYear = entranceDate.getFullYear() === selectedYear
    const matchesVenue = !selectedVenue || entrance.eventID?.location === selectedVenue
    return matchesMonth && matchesYear && matchesVenue
  })

  // Calculate comprehensive statistics
  const stats = {
    // Event Statistics
    totalEvents: filteredEvents.length,
    activeEvents: filteredEvents.filter(e => e.status === 'active').length,
    completedEvents: filteredEvents.filter(e => e.status === 'completed').length,

    // Fight Statistics
    totalFights: filteredFightSchedules.length,
    completedFights: filteredFightSchedules.filter(f => f.status === 'completed').length,
    inProgressFights: filteredFightSchedules.filter(f => f.status === 'in_progress').length,
    scheduledFights: filteredFightSchedules.filter(f => f.status === 'scheduled').length,

    // Match Result Statistics
    totalMatches: filteredMatchResults.length,
    verifiedResults: filteredMatchResults.filter(r => r.verified).length,
    pendingResults: filteredMatchResults.filter(r => !r.verified).length,
    meronWins: filteredMatchResults.filter(r => r.betWinner === 'Meron').length,
    walaWins: filteredMatchResults.filter(r => r.betWinner === 'Wala').length,
    draws: filteredMatchResults.filter(r => r.betWinner === 'Draw').length,

    // Financial Statistics
    totalPlazada: filteredMatchResults.reduce((sum, result) => sum + (result.totalPlazada || 0), 0),
    totalBetPool: filteredMatchResults.reduce((sum, result) => sum + (result.totalBetPool || 0), 0),

    // Cage Rental Statistics
    totalRentals: filteredCageRentals.length,
    activeRentals: filteredCageRentals.filter(r => r.rentalStatus === 'active').length,
    returnedRentals: filteredCageRentals.filter(r => r.rentalStatus === 'returned').length,
    paidRentals: filteredCageRentals.filter(r => r.paymentStatus === 'paid').length,
    unpaidRentals: filteredCageRentals.filter(r => r.paymentStatus === 'unpaid').length,
    totalRentalRevenue: filteredCageRentals.reduce((sum, rental) => sum + (rental.totalPrice || 0), 0),

    // Entrance Statistics
    totalEntrances: filteredEntrances.reduce((sum, entrance) => sum + (entrance.count || 0), 0),
    entranceRecords: filteredEntrances.length,
    // Calculate entrance revenue using dynamic entrance fees
    totalEntranceRevenue: filteredEntrances.reduce((sum, entrance) => sum + ((entrance.count || 0) * (entrance.eventID?.entranceFee || 0)), 0),
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  // Generate chart data with time range filtering
  const generateRevenueData = () => {
    if (!filteredMatchResults.length && !filteredCageRentals.length && !filteredEntrances.length) return []

    const groupedByDate = {}

    // Add plazada data
    filteredMatchResults.forEach(result => {
      const date = new Date(result.createdAt).toISOString().split('T')[0]
      if (!groupedByDate[date]) {
        groupedByDate[date] = { date, plazada: 0, rentals: 0, entrances: 0 }
      }
      groupedByDate[date].plazada += result.totalPlazada || 0
    })

    // Add rental data
    filteredCageRentals.forEach(rental => {
      const date = new Date(rental.date).toISOString().split('T')[0]
      if (!groupedByDate[date]) {
        groupedByDate[date] = { date, plazada: 0, rentals: 0, entrances: 0 }
      }
      groupedByDate[date].rentals += rental.totalPrice || 0
    })

    // Add entrance data
    filteredEntrances.forEach(entrance => {
      const date = new Date(entrance.createdAt).toISOString().split('T')[0]
      if (!groupedByDate[date]) {
        groupedByDate[date] = { date, plazada: 0, rentals: 0, entrances: 0 }
      }
      const entranceRevenue = (entrance.count || 0) * 50 // 50 PHP per entrance
      groupedByDate[date].entrances += entranceRevenue
    })

    let allData = Object.values(groupedByDate).sort((a, b) => new Date(a.date) - new Date(b.date))

    // Filter by time range
    if (allData.length > 0) {
      const referenceDate = new Date(allData[allData.length - 1].date)
      let daysToSubtract = 90
      if (timeRange === "30d") {
        daysToSubtract = 30
      } else if (timeRange === "7d") {
        daysToSubtract = 7
      }
      const startDate = new Date(referenceDate)
      startDate.setDate(startDate.getDate() - daysToSubtract)

      allData = allData.filter(item => {
        const date = new Date(item.date)
        return date >= startDate
      })
    }

    return allData
  }

  const revenueData = generateRevenueData()

  // Chart configuration
  const chartConfig = {
    plazada: {
      label: "Plazada",
      color: "var(--chart-1)",
    },
    rentals: {
      label: "Rentals",
      color: "var(--chart-2)",
    },
    entrances: {
      label: "Entrances",
      color: "var(--chart-3)",
    },
  }

  // Navigation shortcuts
  const navigationShortcuts = [
    {
      title: 'Fight Schedules',
      description: 'Manage fight schedules and match results',
      icon: Swords,
      href: '/admin/fight-schedule',
      color: 'bg-blue-500',
      stats: `${stats.totalFights} fights`
    },
    {
      title: 'Events',
      description: 'View and manage all events',
      icon: Calendar,
      href: '/admin/events',
      color: 'bg-green-500',
      stats: `${stats.totalEvents} events`
    },
    {
      title: 'Entrance Records',
      description: 'Track entrance attendance',
      icon: Ticket,
      href: '/admin/entrance',
      color: 'bg-purple-500',
      stats: `${stats.totalEntrances} entrances`
    },
    {
      title: 'Cage Rentals',
      description: 'Manage cage rentals and availability',
      icon: Building,
      href: '/admin/tangkal',
      color: 'bg-orange-500',
      stats: `${stats.totalRentals} rentals`
    },
    {
      title: 'User Management',
      description: 'Manage system users and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'bg-red-500',
      stats: 'Manage users'
    },
    {
      title: 'Cage Availability',
      description: 'View cage availability status',
      icon: Target,
      href: '/admin/cage-availability',
      color: 'bg-indigo-500',
      stats: 'View availability'
    }
  ]

  return (
    <PageLayout
      title="Admin Dashboard"
      description="Comprehensive overview of the Cockpit Management System"
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

        {/* Navigation Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {navigationShortcuts.map((shortcut) => (
            <Card
              key={shortcut.title}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(shortcut.href)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${shortcut.color}`}>
                    <shortcut.icon className="h-5 w-5 text-white" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-1">{shortcut.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{shortcut.description}</p>
                <Badge variant="secondary" className="text-xs">
                  {shortcut.stats}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(stats.totalPlazada + stats.totalRentalRevenue + stats.totalEntranceRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Plazada: {formatCurrency(stats.totalPlazada)} | Rentals: {formatCurrency(stats.totalRentalRevenue)} | Entrances: {formatCurrency(stats.totalEntranceRevenue)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fights</CardTitle>
              <Swords className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFights}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedFights} completed, {stats.scheduledFights} scheduled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entrances</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalEntrances}</div>
              <p className="text-xs text-muted-foreground">
                From {stats.entranceRecords} records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.activeRentals}</div>
              <p className="text-xs text-muted-foreground">
                {stats.paidRentals} paid, {stats.unpaidRentals} unpaid
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Events and Fights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Events & Fights Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalEvents}</div>
                  <div className="text-xs text-gray-600">Total Events</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.activeEvents}</div>
                  <div className="text-xs text-gray-600">Active Events</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed Fights</span>
                  <span className="font-semibold text-green-600">{stats.completedFights}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">In Progress</span>
                  <span className="font-semibold text-orange-600">{stats.inProgressFights}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Scheduled</span>
                  <span className="font-semibold text-blue-600">{stats.scheduledFights}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Match Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Match Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-600">{stats.meronWins}</div>
                  <div className="text-xs text-gray-600">Meron</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-600">{stats.walaWins}</div>
                  <div className="text-xs text-gray-600">Wala</div>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded">
                  <div className="text-lg font-bold text-yellow-600">{stats.draws}</div>
                  <div className="text-xs text-gray-600">Draws</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Verified Results</span>
                  <span className="font-semibold text-green-600">{stats.verifiedResults}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending Results</span>
                  <span className="font-semibold text-orange-600">{stats.pendingResults}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="pt-0">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Overview
              </CardTitle>
              <CardDescription>
                Plazada, rental, and entrance revenue over time
              </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
                aria-label="Select time range"
              >
                <SelectValue placeholder="Last 3 months" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="90d" className="rounded-lg">
                  Last 3 months
                </SelectItem>
                <SelectItem value="30d" className="rounded-lg">
                  Last 30 days
                </SelectItem>
                <SelectItem value="7d" className="rounded-lg">
                  Last 7 days
                </SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            {revenueData.length > 0 ? (
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="fillPlazada" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-plazada)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-plazada)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillRentals" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-rentals)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-rentals)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillEntrances" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-entrances)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-entrances)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        }}
                        indicator="dot"
                      />
                    }
                  />
                  <Area
                    dataKey="entrances"
                    type="natural"
                    fill="url(#fillEntrances)"
                    stroke="var(--color-entrances)"
                    stackId="a"
                  />
                  <Area
                    dataKey="rentals"
                    type="natural"
                    fill="url(#fillRentals)"
                    stroke="var(--color-rentals)"
                    stackId="a"
                  />
                  <Area
                    dataKey="plazada"
                    type="natural"
                    fill="url(#fillPlazada)"
                    stroke="var(--color-plazada)"
                    stackId="a"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                <p>No revenue data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
                onClick={() => navigate('/admin/events')}
              >
                <Calendar className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Create Event</div>
                  <div className="text-xs text-muted-foreground">Schedule new events</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
                onClick={() => navigate('/admin/users')}
              >
                <Users className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Manage Users</div>
                  <div className="text-xs text-muted-foreground">User permissions & roles</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
                onClick={() => navigate('/admin/fight-schedule')}
              >
                <Swords className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">View Fights</div>
                  <div className="text-xs text-muted-foreground">Monitor fight schedules</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}

export default AdminDashboard
