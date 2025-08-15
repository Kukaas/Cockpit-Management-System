import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Shield, MapPin, CheckCircle, XCircle, AlertTriangle, Clock, TrendingUp, Users } from 'lucide-react'

const CageAvailabilitySummary = ({ summaryData }) => {
  if (!summaryData) return null

  return (
    <Card className="mb-6">
      <CardContent>
        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Cages</p>
            <p className="flex items-center gap-1 text-2xl font-bold">
              <Shield className="h-5 w-5" />
              {summaryData.totalCages}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Active Cages</p>
            <p className="flex items-center gap-1 text-2xl font-bold text-green-600">
              <CheckCircle className="h-5 w-5" />
              {summaryData.activeCages}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Available for Rental</p>
            <p className="flex items-center gap-1 text-2xl font-bold text-blue-600">
              <TrendingUp className="h-5 w-5" />
              {summaryData.availableCages}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Occupied Cages</p>
            <p className="flex items-center gap-1 text-2xl font-bold text-orange-600">
              <Users className="h-5 w-5" />
              {summaryData.occupiedCages}
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
                        <span className="text-xs text-muted-foreground">Total:</span>
                        <Badge variant="outline" className="text-xs">
                          {arena.total}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Active:</span>
                        <Badge variant="default" className="text-xs">
                          {arena.active}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Available:</span>
                        <Badge variant="secondary" className="text-xs">
                          {arena.available}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Rented:</span>
                        <Badge variant="outline" className="text-xs">
                          {arena.rented}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Maintenance:</span>
                        <Badge variant="secondary" className="text-xs">
                          {arena.maintenance}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Inactive:</span>
                        <Badge variant="destructive" className="text-xs">
                          {arena.inactive}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Status Legend */}
        <Separator className="my-4" />
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Status Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700">Active - Available for rental</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-md">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs text-red-700">Inactive - Not available</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-md">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-xs text-yellow-700">Maintenance - Under repair</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-700">Rented - Currently occupied</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CageAvailabilitySummary
