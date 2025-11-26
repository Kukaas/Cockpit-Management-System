import React from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserPlus, Feather, Plus, Swords, Printer } from 'lucide-react'
import DataTable from '@/components/custom/DataTable'

const DataTabs = ({
  activeTab,
  setActiveTab,
  participants,
  cockProfiles,
  participantColumns,
  cockProfileColumns,
  onAddParticipant,
  onAddCockProfile = () => { },
  isEventCompleted = false,
  registrationDeadlinePassed = false,
  // Fight Schedule props
  fights = [],
  fightColumns = [],
  onAddFight = () => { },
  eventStatus = 'active',
  onPrintFightSchedule,
  event,
  formatDate
}) => {
  // Check if event is completed or cancelled
  const isEventDisabled = eventStatus === 'completed' || eventStatus === 'cancelled'

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="participants" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Participants ({participants.length})
        </TabsTrigger>
        <TabsTrigger value="cock-profiles" className="flex items-center gap-2">
          <Feather className="h-4 w-4" />
          Cock Profiles ({cockProfiles.length})
        </TabsTrigger>
        <TabsTrigger value="fight-schedule" className="flex items-center gap-2">
          <Swords className="h-4 w-4" />
          Fight Schedule ({fights.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="participants" className="space-y-4">
        <div className="flex justify-end items-center">
          <Button onClick={onAddParticipant} disabled={isEventCompleted || registrationDeadlinePassed}>
            <Plus className="h-4 w-4 mr-2" />
            Register
          </Button>
        </div>
        <DataTable
          data={participants}
          columns={participantColumns}
          pageSize={10}
          searchable={true}
          filterable={true}
          title="Registered Participants"
          loading={false}
          emptyMessage="No participants registered yet"
          className="shadow-sm"
        />
      </TabsContent>

      <TabsContent value="cock-profiles" className="space-y-4">
        <div className="flex justify-end items-center">
          <Button onClick={onAddCockProfile} disabled={isEventCompleted || registrationDeadlinePassed}>
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

      <TabsContent value="fight-schedule" className="space-y-4">
        <div className="flex justify-end items-center">
          <div className="flex gap-2">
            {onPrintFightSchedule && (
              <Button
                variant="outline"
                onClick={onPrintFightSchedule}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Schedule
              </Button>
            )}
            <Button
              onClick={onAddFight}
              disabled={isEventDisabled}
              title={isEventDisabled ? "Cannot schedule fights for completed/cancelled events" : "Schedule a new fight"}
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Fight
            </Button>
          </div>
        </div>
        <DataTable
          data={fights}
          columns={fightColumns}
          pageSize={10}
          searchable={true}
          filterable={true}
          title="Match List"
          loading={false}
          emptyMessage="No fights scheduled yet"
          className="shadow-sm"
        />
      </TabsContent>
    </Tabs>
  )
}

export default DataTabs
