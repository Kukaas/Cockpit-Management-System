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
import { createViewOnlyParticipantColumns, createViewOnlyCockProfileColumns, createViewOnlyFightScheduleColumns } from './components/ViewOnlyTableColumns'

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

  // Fetch cock profiles
  const { data: cockProfilesData = [] } = useGetAll('/cock-profiles')

  // Fetch fight schedules for this event
  const { data: fightSchedulesData = [] } = useGetAll(`/fight-schedules/event/${eventId}`)

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
    handleViewDetails
  )

  const fightScheduleColumns = createViewOnlyFightScheduleColumns(
    formatCurrency,
    formatDate,
    handleViewDetails
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
      description="View event information, participants, cock profiles, and fight schedules"
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
      />

      {/* Detail View Dialog */}
      <CustomAlertDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        title={`${selectedItem?.type === 'participant' ? 'Participant' : selectedItem?.type === 'cockProfile' ? 'Cock Profile' : 'Fight Schedule'} Details`}
        description={`Detailed information for ${selectedItem?.type === 'participant' ? 'this participant' : selectedItem?.type === 'cockProfile' ? 'this cock profile' : 'this fight schedule'}`}
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
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                      <p className="text-gray-900">{selectedItem.email}</p>
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
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedItem.status === 'confirmed' ? 'bg-green-100 text-green-800' :
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
                      <p className="text-sm font-medium text-gray-600 mb-1">Legband</p>
                      <p className="font-medium text-gray-900">{selectedItem.legband}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Entry No.</p>
                      <p className="text-gray-900">{selectedItem.entryNo}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Owner Name</p>
                      <p className="text-gray-900">{selectedItem.ownerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Weight</p>
                      <p className="font-medium text-gray-900">{selectedItem.weight} kg</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Status</h4>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                    selectedItem.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
          </div>
        )}
      </CustomAlertDialog>
    </PageLayout>
  )
}

export default EventDetails
