import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, Hash, Calendar, Building } from 'lucide-react'

const EntranceStats = ({ totalTallyRecords, totalEntrances, totalRevenue, formatCurrency, maxCapacity }) => {
  // Calculate capacity percentage
  const capacityPercentage = maxCapacity ? Math.round((totalEntrances / maxCapacity) * 100) : 0
  const isAtCapacity = totalEntrances >= maxCapacity
  const remainingCapacity = Math.max(0, maxCapacity - totalEntrances)

  // Get capacity status color
  const getCapacityColor = () => {
    if (isAtCapacity) return 'text-red-600'
    if (capacityPercentage >= 80) return 'text-orange-600'
    return 'text-green-600'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tally Records</CardTitle>
          <Hash className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTallyRecords}</div>
          <p className="text-xs text-muted-foreground">
            Total tally entries recorded
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Entrances</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{totalEntrances}</div>
          <p className="text-xs text-muted-foreground">
            Total people who entered
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total entrance fees collected
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default EntranceStats
