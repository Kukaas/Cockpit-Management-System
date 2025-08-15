import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserPlus, Feather, Swords } from 'lucide-react'
import DataTable from '@/components/custom/DataTable'

const AdminEventTabs = ({
  activeTab,
  setActiveTab,
  participants,
  cockProfiles,
  participantColumns,
  cockProfileColumns,
  fightSchedules = [],
  fightScheduleColumns
}) => {
  const tabCount = fightSchedules && fightSchedules.length > 0 ? 3 : 2

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className={`grid w-full ${tabCount === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <TabsTrigger value="participants" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Participants ({participants.length})
        </TabsTrigger>
        <TabsTrigger value="cock-profiles" className="flex items-center gap-2">
          <Feather className="h-4 w-4" />
          Cock Profiles ({cockProfiles.length})
        </TabsTrigger>
        {fightSchedules && fightSchedules.length > 0 && (
          <TabsTrigger value="fight-schedules" className="flex items-center gap-2">
            <Swords className="h-4 w-4" />
            Fight Schedules ({fightSchedules.length})
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="participants" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Registered Participants</h3>
        </div>
        <DataTable
          data={participants}
          columns={participantColumns}
          pageSize={10}
          searchable={true}
          filterable={true}
          title="Participants"
          loading={false}
          emptyMessage="No participants registered yet"
          className="shadow-sm"
        />
      </TabsContent>

      <TabsContent value="cock-profiles" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Cock Profiles</h3>
        </div>
        <DataTable
          data={cockProfiles}
          columns={cockProfileColumns}
          pageSize={10}
          searchable={true}
          filterable={true}
          title="Cock Profiles"
          loading={false}
          emptyMessage="No cock profiles created yet"
          className="shadow-sm"
        />
      </TabsContent>

      {fightSchedules && fightSchedules.length > 0 && (
        <TabsContent value="fight-schedules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Fight Schedules</h3>
          </div>
          <DataTable
            data={fightSchedules}
            columns={fightScheduleColumns}
            pageSize={10}
            searchable={true}
            filterable={true}
            title="Fight Schedules"
            loading={false}
            emptyMessage="No fight schedules created yet"
            className="shadow-sm"
          />
        </TabsContent>
      )}
    </Tabs>
  )
}

export default AdminEventTabs
