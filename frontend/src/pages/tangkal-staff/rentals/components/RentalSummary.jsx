import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Shield, MapPin, CheckCircle, XCircle, DollarSign, Clock, TrendingUp, Users, Calendar } from 'lucide-react'

const RentalSummary = ({ summaryData }) => {
  if (!summaryData) return null

  const formatPercentage = (value, total) => {
    if (total === 0) return '0%'
    return `${Math.round((value / total) * 100)}%`
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Rental Summary
        </CardTitle>
        <CardDescription>
          Overview of cage rentals and payment status across all arenas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Rentals</p>
            <p className="flex items-center gap-1 text-2xl font-bold">
              <Shield className="h-5 w-5" />
              {summaryData.totalRentals}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Paid Rentals</p>
            <p className="flex items-center gap-1 text-2xl font-bold text-green-600">
              <CheckCircle className="h-5 w-5" />
              {summaryData.paidRentals}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Unpaid Rentals</p>
            <p className="flex items-center gap-1 text-2xl font-bold text-red-600">
              <XCircle className="h-5 w-5" />
              {summaryData.unpaidRentals}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            <p className="flex items-center gap-1 text-2xl font-bold text-blue-600">
              <DollarSign className="h-5 w-5" />
              ₱{summaryData.totalRevenue?.toLocaleString() || '0'}
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Arena Breakdown */}
        {summaryData.arenaBreakdown && summaryData.arenaBreakdown.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Arena Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {summaryData.arenaBreakdown.map((arena) => (
                <Card key={arena.arena} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <h5 className="font-medium text-sm">{arena.arena}</h5>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Total Rentals:</span>
                        <Badge variant="outline" className="text-xs">
                          {arena.totalRentals}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Paid:</span>
                        <Badge variant="default" className="text-xs">
                          {arena.paidRentals}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Unpaid:</span>
                        <Badge variant="destructive" className="text-xs">
                          {arena.unpaidRentals}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Revenue:</span>
                        <Badge variant="secondary" className="text-xs">
                          ₱{arena.revenue?.toLocaleString() || '0'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Payment Rate:</span>
                        <Badge variant="outline" className="text-xs">
                          {formatPercentage(arena.paidRentals, arena.totalRentals)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {summaryData.recentRentals && summaryData.recentRentals.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Recent Rentals</h4>
              <div className="space-y-2">
                {summaryData.recentRentals.slice(0, 5).map((rental) => (
                  <div key={rental._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{rental.nameOfRenter}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(rental.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={rental.paymentStatus === 'paid' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {rental.paymentStatus}
                      </Badge>
                      <span className="text-sm font-medium">₱{rental.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Status Legend */}
        <Separator className="my-4" />
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Payment Status Legend</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700">Paid - Payment received</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-md">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs text-red-700">Unpaid - Payment pending</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RentalSummary
