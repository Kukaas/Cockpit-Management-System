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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Cages</p>
            <p className="flex items-center gap-1 text-2xl font-bold">
              <Shield className="h-5 w-5" />
              {summaryData.totalCages}
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
            <p className="text-sm font-medium text-muted-foreground">Rented Cages</p>
            <p className="flex items-center gap-1 text-2xl font-bold text-orange-600">
              <Users className="h-5 w-5" />
              {summaryData.occupiedCages}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CageAvailabilitySummary
