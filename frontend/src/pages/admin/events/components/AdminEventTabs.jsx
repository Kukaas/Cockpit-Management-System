import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { UserPlus, Feather, Swords, Trophy, Printer, Zap } from 'lucide-react'
import DataTable from '@/components/custom/DataTable'
import ChampionshipTab from '../../fight-schedule/components/ChampionshipTab'
import FastestKillWinnersTab from '../../fight-schedule/components/FastestKillWinnersTab'
import { printFightSchedule } from '@/lib/printFightSchedule'

const AdminEventTabs = ({
  activeTab,
  setActiveTab,
  participants,
  cockProfiles,
  participantColumns,
  cockProfileColumns,
  fightSchedules = [],
  fightScheduleColumns,
  matchResults = [],
  matchResultColumns,
  event = null,
  formatCurrency,
  formatDate
}) => {
  // Print functionality for participants
  const handlePrintParticipants = () => {
    const printWindow = window.open('', '_blank')

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Participants List - ${event?.eventName || 'Event'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .event-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .event-details {
              font-size: 14px;
              color: #666;
              margin-bottom: 5px;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .table th,
            .table td {
              border: 1px solid #333;
              padding: 8px;
              text-align: left;
            }
            .table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .no-column {
              width: 60px;
              text-align: center;
            }
            .name-column {
              width: 200px;
            }
            .wt-column,
            .vs-column {
              width: 100px;
              text-align: center;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="event-title">${event?.eventName || 'Event Name'}</div>
            <div class="event-details">Date: ${event?.date ? new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'N/A'}</div>
            <div class="event-details">Time: ${event?.date ? new Date(event.date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) : 'N/A'}</div>
            <div class="event-details">Type: ${event?.eventType || 'N/A'}</div>
            <div class="event-details">Entrance Fee: ${event?.entranceFee ? formatCurrency(event.entranceFee) : 'N/A'}</div>
            <div class="event-details">Max Participants: ${event?.maxParticipants || 'N/A'}</div>
            <div class="event-details">Registration Deadline: ${event?.registrationDeadline ? new Date(event.registrationDeadline).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'N/A'}</div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th class="no-column">No.</th>
                <th class="name-column">Entry Name / Participant Name</th>
                <th class="wt-column">WT</th>
                <th class="vs-column">VS</th>
              </tr>
            </thead>
            <tbody>
              ${participants.map((participant, index) => `
                <tr>
                  <td class="no-column">${index + 1}</td>
                  <td class="name-column">${participant.participantName}</td>
                  <td class="wt-column"></td>
                  <td class="vs-column"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  // Print functionality for fight schedules
  const handlePrintFightSchedule = () => {
    printFightSchedule({
      event,
      fightSchedules,
      formatDate
    })
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className={`grid w-full ${(event?.eventType === 'derby' || event?.eventType === 'hits_ulutan') ? 'grid-cols-5' :
        event?.eventType === 'fastest_kill' ? 'grid-cols-5' :
          'grid-cols-4'
        }`}>
        <TabsTrigger value="participants" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Participants ({participants.length})
        </TabsTrigger>
        <TabsTrigger value="cock-profiles" className="flex items-center gap-2">
          <Feather className="h-4 w-4" />
          Cock Profiles ({cockProfiles.length})
        </TabsTrigger>
        <TabsTrigger value="fight-schedules" className="flex items-center gap-2">
          <Swords className="h-4 w-4" />
          Fight Schedules ({fightSchedules.length})
        </TabsTrigger>
        <TabsTrigger value="match-results" className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Match Results ({matchResults.length})
        </TabsTrigger>
        {(event?.eventType === 'derby' || event?.eventType === 'hits_ulutan') && (
          <TabsTrigger value="championship" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Championship
          </TabsTrigger>
        )}
        {event?.eventType === 'fastest_kill' && (
          <TabsTrigger value="fastest-kill" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Fastest Kill Winners
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="participants" className="space-y-4">
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

      <TabsContent value="fight-schedules" className="space-y-4">
        <div className="flex justify-end items-center">
          <Button
            onClick={handlePrintFightSchedule}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Schedule
          </Button>
        </div>
        <DataTable
          data={fightSchedules}
          columns={fightScheduleColumns}
          pageSize={10}
          searchable={true}
          filterable={true}
          title="Match List"
          loading={false}
          emptyMessage="No fight schedules created yet"
          className="shadow-sm"
        />
      </TabsContent>

      <TabsContent value="match-results" className="space-y-4">
        <DataTable
          data={matchResults}
          columns={matchResultColumns}
          pageSize={10}
          searchable={true}
          filterable={true}
          title="Match Results"
          loading={false}
          emptyMessage="No match results recorded yet"
          className="shadow-sm"
        />
      </TabsContent>

      {(event?.eventType === 'derby' || event?.eventType === 'hits_ulutan') && (
        <TabsContent value="championship" className="space-y-4">
          <ChampionshipTab
            eventId={event?._id}
            eventType={event?.eventType}
            formatCurrency={formatCurrency}
          />
        </TabsContent>
      )}

      {event?.eventType === 'fastest_kill' && (
        <TabsContent value="fastest-kill" className="space-y-4">
          <FastestKillWinnersTab
            eventId={event?._id}
            eventType={event?.eventType}
            formatCurrency={formatCurrency}
          />
        </TabsContent>
      )}
    </Tabs>
  )
}

export default AdminEventTabs
