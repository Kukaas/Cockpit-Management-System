import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Eye } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { useGetAll, useGetById } from '@/hooks/useApiQueries'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'

// Import custom components
import EventDetailsCard from '../../entrance-staff/entrance-registration/components/EventDetailsCard'
import AdminEventTabs from './components/AdminEventTabs'
import { createViewOnlyParticipantColumns, createViewOnlyCockProfileColumns, createViewOnlyFightScheduleColumns, createViewOnlyMatchResultColumns } from './components/ViewOnlyTableColumns'

const EventDetails = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()

  // State management
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [activeTab, setActiveTab] = useState('participants')
  const [selectedItem, setSelectedItem] = useState(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useGetById('/events', eventId)

  // Fetch participants for this event
  const { data: participantsData = [] } = useGetAll(`/participants?eventID=${eventId}`)

  // Fetch cock profiles for this specific event
  const { data: cockProfilesData = [] } = useGetAll(`/cock-profiles?eventID=${eventId}`)

  // Fetch fight schedules for this event
  const { data: fightSchedulesData = [] } = useGetAll(`/fight-schedules/event/${eventId}`)

  // Fetch match results for this event
  const { data: matchResultsData = [] } = useGetAll(`/match-results/event/${eventId}`)

  // Update state when data changes
  useEffect(() => {
    if (event && event._id && (!selectedEvent || selectedEvent._id !== event._id)) {
      setSelectedEvent(event)
    }
  }, [event, selectedEvent])

  // Use the API data directly
  const participants = participantsData || []
  const cockProfiles = cockProfilesData || []
  const fightSchedules = fightSchedulesData || []
  const matchResults = matchResultsData || []

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

  // Create table columns
  const participantColumns = createViewOnlyParticipantColumns(
    formatCurrency,
    handleViewDetails
  )

  const cockProfileColumns = createViewOnlyCockProfileColumns(
    handleViewDetails,
    selectedEvent?.eventType
  )

  const fightScheduleColumns = createViewOnlyFightScheduleColumns(
    formatCurrency,
    formatDate,
    handleViewDetails
  )

  const matchResultColumns = createViewOnlyMatchResultColumns(
    formatCurrency,
    formatDate,
    handleViewDetails,
    selectedEvent?.eventType
  )

  if (eventLoading) {
    return (
      <PageLayout title="Loading..." description="Loading event details...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </PageLayout>
    )
  }

  if (!selectedEvent) {
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
      title={`Event Details - ${selectedEvent.eventName}`}
      description="View event information, participants, cock profiles, fight schedules, and match results"
      headerButton={
        <Button variant="outline" onClick={() => navigate('/admin/events')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      }
    >
      {/* Event Details Card */}
      <EventDetailsCard
        event={selectedEvent}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />

      {/* Admin Event Tabs */}
      <AdminEventTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        participants={participants}
        cockProfiles={cockProfiles}
        participantColumns={participantColumns}
        cockProfileColumns={cockProfileColumns}
        fightSchedules={fightSchedules}
        fightScheduleColumns={fightScheduleColumns}
        matchResults={matchResults}
        matchResultColumns={matchResultColumns}
        event={selectedEvent}
        formatCurrency={formatCurrency}
      />

      {/* Detail View Dialog */}
      <CustomAlertDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        title={`${selectedItem?.type === 'participant' ? 'Participant' : selectedItem?.type === 'cockProfile' ? 'Cock Profile' : selectedItem?.type === 'fightSchedule' ? 'Fight Schedule' : 'Match Result'} Details`}
        description={`Detailed information for ${selectedItem?.type === 'participant' ? 'this participant' : selectedItem?.type === 'cockProfile' ? 'this cock profile' : selectedItem?.type === 'fightSchedule' ? 'this fight schedule' : 'this match result'}`}
        maxHeight="max-h-[85vh]"
        actions={
          <Button onClick={handleCloseDetails} className="w-full sm:w-auto">
            Close
          </Button>
        }
      >
        {selectedItem && (
          <div className="space-y-6 overflow-y-auto pr-2">
            {selectedItem.type === 'participant' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Name</p>
                      <p className="font-medium text-gray-900">{selectedItem.participantName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Contact Number</p>
                      <p className="text-gray-900">{selectedItem.contactNumber}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">Address</p>
                    <p className="text-gray-900">{selectedItem.address}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Registration Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${selectedItem.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        selectedItem.status === 'withdrawn' ? 'bg-red-100 text-red-800' :
                          selectedItem.status === 'disqualified' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                        {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Registration Date</p>
                      <p className="text-gray-900">{formatDate(selectedItem.registrationDate)}</p>
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

            {selectedItem.type === 'cockProfile' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Cock Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Entry No.</p>
                      <p className="font-medium text-gray-900">#{selectedItem.entryNo}</p>
                    </div>
                    {selectedEvent?.eventType === 'derby' && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Legband Number</p>
                          <p className="font-medium text-gray-900">{selectedItem.legband || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Weight</p>
                          <p className="font-medium text-gray-900">{selectedItem.weight ? `${selectedItem.weight} kg` : 'N/A'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Owner Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Owner Name</p>
                      <p className="font-medium text-gray-900">{selectedItem.participantID?.participantName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Contact Number</p>
                      <p className="font-medium text-gray-900">{selectedItem.participantID?.contactNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">Address</p>
                    <p className="text-gray-900">{selectedItem.participantID?.address || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Status</h4>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${selectedItem.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {selectedItem.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {selectedItem.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-lg mb-3 text-gray-900">Notes</h4>
                    <p className="text-gray-900">{selectedItem.notes}</p>
                  </div>
                )}
              </div>
            )}

            {selectedItem.type === 'fightSchedule' && (
              <div className="space-y-6">
                {/* Fight Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">#</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">Fight Information</h3>
                      <p className="text-sm text-gray-500">Fight #{selectedItem.fightNumber}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                          <div className="mt-1">
                            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${selectedItem.status === 'completed' ? 'bg-green-100 text-green-800' :
                              selectedItem.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                selectedItem.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                              }`}>
                              {selectedItem.status.replace('_', ' ').charAt(0).toUpperCase() + selectedItem.status.replace('_', ' ').slice(1)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Outcome</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedItem.betWinner || 'N/A'}</p>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

                {/* Participants */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-lg">👥</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">Participants</h3>
                      <p className="text-sm text-gray-500">Fight participants and their details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {selectedItem.participantsID?.map((participant, index) => (
                      <div key={participant._id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <h4 className="font-medium text-gray-900">Participant {index + 1}</h4>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                            <p className="mt-1 text-sm text-gray-900">{participant.participantName}</p>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</label>
                            <p className="mt-1 text-sm text-gray-900">{participant.contactNumber}</p>
                          </div>

                          {participant.email && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                              <p className="mt-1 text-sm text-gray-900">{participant.email}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cock Profiles */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-lg">🐓</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">Cock Profiles</h3>
                      <p className="text-sm text-gray-500">Cock details and specifications</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {selectedItem.cockProfileID?.map((cock, index) => (
                      <div key={cock._id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <h4 className="font-medium text-gray-900">Cock {index + 1}</h4>
                        </div>

                        <div className="space-y-3">
                          {/* Entry Number - shown for all events */}
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Entry Number</label>
                            <p className="mt-1 text-sm text-gray-900">#{cock.entryNo}</p>
                          </div>

                          {/* Legband Number and Weight - only shown for derby events */}
                          {selectedEvent?.eventType === 'derby' && (
                            <>
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Legband Number</label>
                                <p className="mt-1 text-sm text-gray-900">{cock.legband || 'N/A'}</p>
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Weight</label>
                                <p className="mt-1 text-sm text-gray-900">{cock.weight ? `${cock.weight}kg` : 'N/A'}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedItem.type === 'matchResult' && (
              <div className="space-y-6">
                {/* Match Result Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <span className="text-emerald-600 font-semibold text-lg">🏆</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">Match Result</h3>
                      <p className="text-sm text-gray-500">Fight #{selectedItem.matchID?.fightNumber} - {selectedItem.betWinner || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Verification</label>
                        <div className="mt-1">
                          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${selectedItem.verified ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                            }`}>
                            {selectedItem.verified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Only show match timing for fastest kill events */}
                    {selectedEvent?.eventType === 'fastest_kill' && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Match Time</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedItem.matchTimeSeconds ? (() => {
                              const minutes = Math.floor(selectedItem.matchTimeSeconds / 60)
                              const seconds = (selectedItem.matchTimeSeconds % 60).toFixed(2)
                              return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
                            })() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Betting Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">₱</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">Betting Information</h3>
                      <p className="text-sm text-gray-500">Bet amounts and payouts</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Bet Pool</label>
                      <p className="mt-1 text-lg font-semibold text-blue-700">{formatCurrency(selectedItem.totalBetPool)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Plazada</label>
                      <p className="mt-1 text-lg font-semibold text-emerald-700">{formatCurrency(selectedItem.totalPlazada)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bet Winner</label>
                      <div className="mt-1">
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${selectedItem.betWinner === 'Meron' ? 'bg-blue-100 text-blue-800' :
                          selectedItem.betWinner === 'Wala' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {selectedItem.betWinner}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {selectedItem.participantBets?.map((bet) => (
                      <div key={bet.participantID._id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-3 h-3 rounded-full ${bet.position === 'Meron' ? 'bg-blue-500' : 'bg-gray-500'
                            }`}></div>
                          <h4 className="font-medium text-gray-900">{bet.position}</h4>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Participant</label>
                            <p className="mt-1 text-sm text-gray-900">{bet.participantID.participantName}</p>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bet Amount</label>
                            <p className="mt-1 text-sm font-semibold text-gray-900">{formatCurrency(bet.betAmount)}</p>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              {selectedItem.betWinner === bet.position ? 'Plazada (Winner - No Plazada)' : 'Plazada (10% - Loser)'}
                            </label>
                            <p className="mt-1 text-sm font-semibold text-emerald-600">
                              {selectedItem.betWinner === bet.position ? '₱0' : formatCurrency(bet.betAmount * 0.10)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Winner & Loser */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-lg">🏅</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">Winner & Loser</h3>
                      <p className="text-sm text-gray-500">Match outcome details</p>
                    </div>
                  </div>

                  {['Draw', 'Cancelled'].includes(selectedItem.betWinner) ? (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700">
                      {selectedItem.betWinner === 'Draw'
                        ? 'This match ended in a draw. No winner or loser was declared.'
                        : 'This match was cancelled. Participants remain available for future fights.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <h4 className="font-medium text-green-800">Winner</h4>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Participant</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedItem.resultMatch?.winnerParticipantID?.participantName}</p>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Entry Number</label>
                            <p className="mt-1 text-sm text-gray-900">#{selectedItem.resultMatch?.winnerCockProfileID?.entryNo}</p>
                          </div>

                          {selectedEvent?.eventType === 'derby' && (
                            <>
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Legband Number</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedItem.resultMatch?.winnerCockProfileID?.legband || 'N/A'}</p>
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Weight</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedItem.resultMatch?.winnerCockProfileID?.weight ? `${selectedItem.resultMatch?.winnerCockProfileID?.weight}kg` : 'N/A'}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <h4 className="font-medium text-red-800">Loser</h4>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Participant</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedItem.resultMatch?.loserParticipantID?.participantName}</p>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Entry Number</label>
                            <p className="mt-1 text-sm text-gray-900">#{selectedItem.resultMatch?.loserCockProfileID?.entryNo}</p>
                          </div>

                          {selectedEvent?.eventType === 'derby' && (
                            <>
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Legband Number</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedItem.resultMatch?.loserCockProfileID?.legband || 'N/A'}</p>
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Weight</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedItem.resultMatch?.loserCockProfileID?.weight ? `${selectedItem.resultMatch?.loserCockProfileID?.weight}kg` : 'N/A'}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payout Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-lg">💰</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">Payout Information</h3>
                      <p className="text-sm text-gray-500">Financial details and payouts</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Meron Payout</label>
                      <p className="mt-2 text-xl font-semibold text-purple-700">{formatCurrency(selectedItem.payouts?.meronPayout || 0)}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Wala Payout</label>
                      <p className="mt-2 text-xl font-semibold text-purple-700">{formatCurrency(selectedItem.payouts?.walaPayout || 0)}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Outside Bets</label>
                      <p className="mt-2 text-xl font-semibold text-purple-700">{formatCurrency(selectedItem.payouts?.outsideBets || 0)}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Plazada</label>
                      <p className="mt-2 text-xl font-semibold text-emerald-700">{formatCurrency(selectedItem.totalPlazada || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CustomAlertDialog>
    </PageLayout>
  )
}

export default EventDetails

