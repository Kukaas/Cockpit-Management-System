import PageLayout from '@/layouts/PageLayout'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, Users, Home, Settings, TrendingUp, TrendingDown, Activity, Filter } from 'lucide-react'
import { useGetAll } from '@/hooks/useApiQueries'
import NativeSelect from '@/components/custom/NativeSelect'
import { RentalChart } from './rentals/components/RentalChart'

const TangkalDashboard = () => {
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedEvent, setSelectedEvent] = useState('')
  const [selectedVenue, setSelectedVenue] = useState('')

  // Fetch data with filters
  const { data: availabilityData } = useGetAll('/cage-availability/summary')
  const { data: eventsData } = useGetAll('/events?status=active')
  const { data: rentalsData } = useGetAll('/cage-rentals')

  // Filter data based on selected filters
  const filteredRentals = rentalsData?.filter(rental => {
    const rentalDate = new Date(rental.date)
    const matchesMonth = rentalDate.getMonth() === selectedMonth
    const matchesYear = rentalDate.getFullYear() === selectedYear
    const matchesEvent = !selectedEvent || rental.eventID?._id === selectedEvent
    const matchesVenue = !selectedVenue || rental.arena === selectedVenue

    return matchesMonth && matchesYear && matchesEvent && matchesVenue
  }) || []

  // Calculate filtered statistics
  const filteredStats = {
    totalRentals: filteredRentals.length,
    totalRevenue: filteredRentals.reduce((sum, rental) => sum + (rental.totalPrice || 0), 0),
    paidRentals: filteredRentals.filter(rental => rental.paymentStatus === 'paid').length,
    unpaidRentals: filteredRentals.filter(rental => rental.paymentStatus === 'unpaid').length,
    activeRentals: filteredRentals.filter(rental => rental.rentalStatus === 'active').length,
    returnedRentals: filteredRentals.filter(rental => rental.rentalStatus === 'returned').length,
    totalCagesRented: filteredRentals.reduce((sum, rental) => sum + (rental.quantity || 0), 0),
    activeCagesRented: filteredRentals.filter(rental => rental.rentalStatus === 'active').reduce((sum, rental) => sum + (rental.quantity || 0), 0)
  }

  // Calculate filtered availability data
  const getFilteredAvailabilityData = () => {
    if (!availabilityData?.arenaBreakdown) return availabilityData

    // If venue filter is applied, show only that venue's data
    if (selectedVenue) {
      const filteredArena = availabilityData.arenaBreakdown.find(arena => arena.arena === selectedVenue)
      if (filteredArena) {
        return {
          totalCages: filteredArena.total,
          availableCages: filteredArena.available,
          occupiedCages: filteredArena.rented,
          arenaBreakdown: [filteredArena]
        }
      }
    }

    // If no venue filter, show all venues but calculate totals from filtered rentals
    const activeCagesRentedInPeriod = filteredStats.activeCagesRented
    const totalCages = availabilityData.totalCages
    const availableCages = availabilityData.availableCages - activeCagesRentedInPeriod
    const occupiedCages = availabilityData.occupiedCages + activeCagesRentedInPeriod

    return {
      ...availabilityData,
      availableCages: Math.max(0, availableCages),
      occupiedCages: Math.min(totalCages, occupiedCages)
    }
  }

  const filteredAvailabilityData = getFilteredAvailabilityData()

  // Get events for filter
  const events = eventsData || []
  const venues = ['Buenavista Cockpit Arena']

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

  const dashboardCards = [
    {
      title: 'Cage Availability',
      description: 'Manage cage availability records and track cage status across different arenas',
      icon: <Home className="h-8 w-8" />,
      action: () => navigate('/tangkal-staff/cage-availability'),
      color: 'bg-blue-500',
      badge: 'Manage'
    },
    {
      title: 'Cage Rentals',
      description: 'Manage cage rentals, track payments, and monitor availability',
      icon: <Calendar className="h-8 w-8" />,
      action: () => navigate('/tangkal-staff/cage-rentals'),
      color: 'bg-green-500',
      badge: 'Active'
    },
    {
      title: 'Payment Tracking',
      description: 'Monitor payment status and send reminders',
      icon: <DollarSign className="h-8 w-8" />,
      action: () => navigate('/tangkal-staff/cage-rentals'),
      color: 'bg-yellow-500',
      badge: 'Track'
    }
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

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
      title="Tangkal Staff Dashboard"
      description="Manage cage rentals and arena operations"
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
                  {events.map((event) => (
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
               <CardTitle className="text-sm font-medium">Total Cages</CardTitle>
               <Home className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{filteredAvailabilityData?.totalCages || 0}</div>
               <p className="text-xs text-muted-foreground">
                 {selectedVenue ? `In ${selectedVenue}` : 'Across all arenas'}
               </p>
             </CardContent>
           </Card>

           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Available Cages</CardTitle>
               <TrendingUp className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold text-green-600">{filteredAvailabilityData?.availableCages || 0}</div>
               <p className="text-xs text-muted-foreground">
                 Ready for rental
               </p>
             </CardContent>
           </Card>

           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
               <Activity className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold text-blue-600">{filteredStats.activeRentals}</div>
               <p className="text-xs text-muted-foreground">
                 Currently active rentals
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
                 {selectedEvent || selectedVenue || selectedMonth !== new Date().getMonth() || selectedYear !== new Date().getFullYear()
                   ? 'From filtered rentals'
                   : 'From all rentals'}
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

                 {/* Arena Breakdown */}
         {filteredAvailabilityData?.arenaBreakdown && (
           <Card>
             <CardHeader>
               <CardTitle className="text-lg">Arena Breakdown</CardTitle>
               <CardDescription>
                 Cage availability across different arenas
                 {selectedVenue && ` - Filtered to ${selectedVenue}`}
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {filteredAvailabilityData.arenaBreakdown.map((arena) => (
                   <div key={arena.arena} className="p-4 border rounded-lg">
                     <div className="flex items-center gap-2 mb-3">
                       <Home className="h-4 w-4 text-blue-600" />
                       <h4 className="font-medium text-sm">{arena.arena}</h4>
                     </div>
                     <div className="space-y-2">
                       <div className="flex justify-between items-center">
                         <span className="text-xs text-muted-foreground">Total:</span>
                         <Badge variant="outline" className="text-xs">{arena.total}</Badge>
                       </div>
                       <div className="flex justify-between items-center">
                         <span className="text-xs text-muted-foreground">Available:</span>
                         <Badge variant="default" className="text-xs">{arena.available}</Badge>
                       </div>
                       <div className="flex justify-between items-center">
                         <span className="text-xs text-muted-foreground">Rented:</span>
                         <Badge variant="secondary" className="text-xs">{arena.rented}</Badge>
                       </div>
                       <div className="flex justify-between items-center">
                         <span className="text-xs text-muted-foreground">Maintenance:</span>
                         <Badge variant="destructive" className="text-xs">{arena.maintenance}</Badge>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         )}

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${card.color} text-white`}>
                    {card.icon}
                  </div>
                  <Badge variant="secondary">{card.badge}</Badge>
                </div>
                <CardTitle className="mt-4">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={card.action}
                  className="w-full"
                  variant="outline"
                >
                  Access {card.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}

export default TangkalDashboard
