import React from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserPlus, Feather, Plus } from 'lucide-react'
import DataTable from '@/components/custom/DataTable'

const DataTabs = ({
  activeTab,
  setActiveTab,
  participants,
  cockProfiles,
  participantColumns,
  cockProfileColumns,
  onAddParticipant,
  onAddCockProfile,
  isEventCompleted = false
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="participants" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Participants ({participants.length})
        </TabsTrigger>
        <TabsTrigger value="cock-profiles" className="flex items-center gap-2">
          <Feather className="h-4 w-4" />
          Cock Profiles ({cockProfiles.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="participants" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Registered Participants</h3>
          <Button onClick={onAddParticipant} disabled={isEventCompleted}>
            <Plus className="h-4 w-4 mr-2" />
            Add Participant
          </Button>
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
          <Button onClick={onAddCockProfile} disabled={isEventCompleted}>
            <Plus className="h-4 w-4 mr-2" />
            Add Cock Profile
          </Button>
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
    </Tabs>
  )
}

export default DataTabs
