import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Award, Target, Users, DollarSign, TrendingUp } from 'lucide-react'
import { useGetAll } from '@/hooks/useApiQueries'
import { createChampionshipColumns } from './TableColumns'
import DataTable from '@/components/custom/DataTable'

const ChampionshipTab = ({ eventId, eventType, formatCurrency }) => {
  // Fetch championship standings
  const { data: championshipData, isLoading } = useGetAll(`/match-results/derby-championship/${eventId}`)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!championshipData || (eventType !== 'derby' && eventType !== 'hits_ulutan')) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p>Championship data not available for this event type.</p>
      </div>
    )
  }

  const { event, standings = [], totalMatches = 0, completedMatches = 0 } = championshipData
  const winRequirement = event?.winRequirement || event?.noCockRequirements || 2
  const prizeDistribution = championshipData?.prizeDistribution || []
  const remainingMatches = championshipData?.remainingMatches || (totalMatches - completedMatches)

  // Prepare data for DataTable by adding position and prize information
  const tableData = standings?.map(standing => {
    const champion = prizeDistribution.find(c => c.participant._id === standing.participant._id)
    return {
      ...standing,
      position: champion?.position || null,
      prizePercentage: champion?.prizePercentage || null,
      prizeAmount: champion?.prizeAmount || null
    }
  }) || []

  // Create championship columns
  const championshipColumns = createChampionshipColumns(formatCurrency)

  return (
    <div className="space-y-6">
      {/* Championship Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Championship Overview
          </CardTitle>
          <CardDescription>
            Track participant progress towards becoming champions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{winRequirement}</div>
              <div className="text-sm text-blue-600">{eventType === 'hits_ulutan' ? 'Wins Required' : 'Cocks Required'}</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{standings?.filter(s => s.isChampion).length || 0}</div>
              <div className="text-sm text-green-600">Champions</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{completedMatches || 0}</div>
              <div className="text-sm text-orange-600">Matches Completed</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(event?.prize || 0)}</div>
              <div className="text-sm text-purple-600">Total Prize Pool</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Championship Standings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Championship Standings
          </CardTitle>
          <CardDescription>
            Current participant standings and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={tableData}
            columns={championshipColumns}
            title="Championship Standings"
            searchable={true}
            filterable={true}
            pageSize={10}
            emptyMessage="No championship data available"
          />
        </CardContent>
      </Card>

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Progress Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0}%
              </div>
              <div className="text-sm text-green-600">Event Progress</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{remainingMatches || 0}</div>
              <div className="text-sm text-blue-600">Remaining Matches</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {standings?.filter(s => !s.isChampion && !s.isEliminated).length || 0}
              </div>
              <div className="text-sm text-yellow-600">Active Participants</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChampionshipTab
