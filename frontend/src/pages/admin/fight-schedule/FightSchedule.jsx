import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { useGetById, useGetAll } from '@/hooks/useApiQueries'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'

// Import custom components
import EventDetailsCard from './components/EventDetailsCard'
import AdminFightTabs from './components/FightTabs'
import { createFightColumns, createMatchResultColumns } from './components/TableColumns'

const AdminFightSchedule = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()

  // State management
  const [activeTab, setActiveTab] = useState('fights')
  const [selectedItem, setSelectedItem] = useState(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useGetById('/events', eventId)

  // Fetch fight schedules for this event
  const { data: fightsData = [] } = useGetAll(`/fight-schedules/event/${eventId}`)

  // Fetch match results for this event
  const { data: resultsData = [] } = useGetAll(`/match-results/event/${eventId}`)

  // Format functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  // Handle view details
  const handleViewDetails = (item, type) => {
    setSelectedItem({ ...item, type })
    setDetailDialogOpen(true)
  }

  const handleCloseDetails = () => {
    setDetailDialogOpen(false)
    setSelectedItem(null)
  }

  // Create table columns (view-only)
  const fightColumns = createFightColumns(formatCurrency, formatDate, handleViewDetails)
  const resultColumns = createMatchResultColumns(formatCurrency, formatDate, handleViewDetails)

  if (eventLoading) {
    return (
      <PageLayout title="Loading..." description="Loading event details...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </PageLayout>
    )
  }

  if (!event) {
    return (
      <PageLayout title="Event Not Found" description="The requested event could not be found.">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Event not found</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={`Fight Schedule - ${event.eventName}`}
      description="View fight schedules and match results for this event"
      headerButton={
        <Button variant="outline" onClick={() => navigate('/admin/fight-schedule')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      }
    >
      {/* Event Details Card */}
      <EventDetailsCard
        event={event}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />

      {/* Fight and Results Tabs */}
      <AdminFightTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fights={fightsData}
        results={resultsData}
        fightColumns={fightColumns}
        resultColumns={resultColumns}
      />

      {/* Detail View Dialog */}
      <CustomAlertDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        title={`${selectedItem?.type === 'fight' ? 'Fight Schedule' : 'Match Result'} Details`}
        description={`Detailed information for ${selectedItem?.type === 'fight' ? 'this fight schedule' : 'this match result'}`}
        maxHeight="max-h-[85vh]"
        actions={
          <Button onClick={handleCloseDetails} className="w-full sm:w-auto">
            Close
          </Button>
        }
      >
        {selectedItem && (
          <div className="space-y-6 overflow-y-auto pr-2">
            {selectedItem.type === 'fight' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Fight Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Fight Number</p>
                      <p className="font-medium text-gray-900">#{selectedItem.fightNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedItem.status === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedItem.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        selectedItem.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedItem.status.replace('_', ' ').charAt(0).toUpperCase() + selectedItem.status.replace('_', ' ').slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Total Bet</p>
                      <p className="font-medium text-green-600">{formatCurrency(selectedItem.totalBet)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Plazada Fee</p>
                      <p className="font-medium text-blue-600">{formatCurrency(selectedItem.plazadaFee)}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">Scheduled Time</p>
                    <p className="text-gray-900">{formatDate(selectedItem.scheduledTime)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Participants</h4>
                  <div className="space-y-2">
                    {selectedItem.participantsID?.map((participant, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-white rounded border">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{participant.participantName}</p>
                          <p className="text-sm text-gray-600">{participant.contactNumber}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Cock Profiles</h4>
                  <div className="space-y-2">
                    {selectedItem.cockProfileID?.map((cock, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-white rounded border">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{cock.legband}</p>
                          <p className="text-sm text-gray-600">{cock.ownerName} ({cock.weight}kg)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedItem.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-lg mb-3 text-gray-900">Notes</h4>
                    <p className="text-gray-900">{selectedItem.notes}</p>
                  </div>
                )}
              </div>
            )}

            {selectedItem.type === 'matchResult' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Match Result Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Fight Number</p>
                      <p className="font-medium text-gray-900">#{selectedItem.matchID?.fightNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedItem.status === 'final' ? 'bg-green-100 text-green-800' :
                        selectedItem.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        selectedItem.status === 'disputed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Total Bet</p>
                      <p className="font-medium text-green-600">{formatCurrency(selectedItem.totalBet)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Bet Winner</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedItem.betWinner === 'Meron' ? 'bg-blue-100 text-blue-800' :
                        selectedItem.betWinner === 'Wala' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedItem.betWinner}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">Match Start Time</p>
                    <p className="text-gray-900">{formatDate(selectedItem.matchStartTime)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Winner & Loser</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h5 className="font-medium text-green-800 mb-2">Winner</h5>
                      <p className="font-medium text-gray-900">{selectedItem.resultMatch?.winnerParticipantID?.participantName}</p>
                      <p className="text-sm text-gray-600">{selectedItem.resultMatch?.winnerCockProfileID?.legband} ({selectedItem.resultMatch?.winnerCockProfileID?.ownerName})</p>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h5 className="font-medium text-red-800 mb-2">Loser</h5>
                      <p className="font-medium text-gray-900">{selectedItem.resultMatch?.loserParticipantID?.participantName}</p>
                      <p className="text-sm text-gray-600">{selectedItem.resultMatch?.loserCockProfileID?.legband} ({selectedItem.resultMatch?.loserCockProfileID?.ownerName})</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Prize Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Winner Prize</p>
                      <p className="font-medium text-green-600">{formatCurrency(selectedItem.prize?.winnerPrize)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">House Cut</p>
                      <p className="font-medium text-blue-600">{formatCurrency(selectedItem.prize?.houseCut)}</p>
                    </div>
                  </div>
                </div>

                {selectedItem.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-lg mb-3 text-gray-900">Notes</h4>
                    <p className="text-gray-900">{selectedItem.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CustomAlertDialog>
    </PageLayout>
  )
}

export default AdminFightSchedule
