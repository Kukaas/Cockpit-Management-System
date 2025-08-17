import React from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserPlus, Plus } from 'lucide-react'
import DataTable from '@/components/custom/DataTable'

const DataTabs = ({
  activeTab,
  setActiveTab,
  entrances,
  entranceColumns,
  onAddEntrance,
  isEventCompleted = false
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-1">
        <TabsTrigger value="entrances" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Entrance Tally Records ({entrances.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="entrances" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Entrance Tally Records</h3>
          <Button onClick={onAddEntrance} disabled={isEventCompleted}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tally
          </Button>
        </div>
        <DataTable
          data={entrances}
          columns={entranceColumns}
          pageSize={10}
          searchable={true}
          filterable={true}
          title="Entrance Tally Records"
          loading={false}
          emptyMessage="No entrance tally records yet"
          className="shadow-sm"
        />
      </TabsContent>
    </Tabs>
  )
}

export default DataTabs
