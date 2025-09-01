import React from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Swords, Trophy, Plus, Award } from 'lucide-react'
import DataTable from '@/components/custom/DataTable'

const FightTabs = ({
  activeTab,
  setActiveTab,
  fights,
  results,
  fightColumns,
  resultColumns,
  onAddFight,
  eventStatus = 'active', // Add event status prop with default value
  eventType = 'regular'
}) => {
  // Check if event is completed or cancelled
  const isEventCompleted = eventStatus === 'completed' || eventStatus === 'cancelled'

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className={`grid w-full ${eventType === 'derby' ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <TabsTrigger value="fights" className="flex items-center gap-2">
          <Swords className="h-4 w-4" />
          Fight Schedule ({fights.length})
        </TabsTrigger>
        <TabsTrigger value="results" className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Match Results ({results.length})
        </TabsTrigger>
        {eventType === 'derby' && (
          <TabsTrigger value="championship" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Championship
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="fights" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Scheduled Fights</h3>
          <Button
            onClick={onAddFight}
            disabled={isEventCompleted}
            title={isEventCompleted ? "Cannot schedule fights for completed/cancelled events" : "Schedule a new fight"}
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Fight
          </Button>
        </div>
        <DataTable
          data={fights}
          columns={fightColumns}
          pageSize={10}
          searchable={true}
          filterable={true}
          title="Fights"
          loading={false}
          emptyMessage="No fights scheduled yet"
          className="shadow-sm"
        />
      </TabsContent>

      <TabsContent value="results" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Match Results</h3>
        </div>
        <DataTable
          data={results}
          columns={resultColumns}
          pageSize={10}
          searchable={true}
          filterable={true}
          title="Results"
          loading={false}
          emptyMessage="No match results recorded yet"
          className="shadow-sm"
        />
      </TabsContent>
    </Tabs>
  )
}

export default FightTabs
