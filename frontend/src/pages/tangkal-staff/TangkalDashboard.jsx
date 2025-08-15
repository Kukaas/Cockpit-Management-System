import PageLayout from '@/layouts/PageLayout'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, Users, Home, Settings } from 'lucide-react'

const TangkalDashboard = () => {
  const navigate = useNavigate()

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

  return (
    <PageLayout
      title="Tangkal Staff Dashboard"
      description="Manage cage rentals and arena operations"
    >
      <div className="space-y-6">
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cages</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Across all arenas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cages</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Available for rental
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Rentals</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Currently rented
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}

export default TangkalDashboard
