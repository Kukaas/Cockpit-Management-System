import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { toast } from 'sonner'
import { useGetAll, useGetById } from '@/hooks/useApiQueries'
import { useCreateMutation, usePutMutation, useCustomMutation } from '@/hooks/useApiMutations'
import api from '@/services/api'
import ConfirmationDialog from '@/components/custom/ConfirmationDialog'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'

// Import custom components
import EventDetailsCard from './components/EventDetailsCard'
import ParticipantForm from './components/ParticipantForm'
import CockProfileForm from './components/CockProfileForm'
import DataTabs from './components/DataTabs'
import { createParticipantColumns, createCockProfileColumns } from './components/TableColumns'
import FightForm from '@/pages/event-staff/fight-schedule/components/FightForm'
import { createFightColumns } from '@/pages/event-staff/fight-schedule/components/TableColumns'

const ParticipantRegistration = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()

  // State management
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [activeTab, setActiveTab] = useState('participants')

  // Dialog states
  const [addParticipantDialogOpen, setAddParticipantDialogOpen] = useState(false)
  const [addCockProfileDialogOpen, setAddCockProfileDialogOpen] = useState(false)
  const [editParticipantDialogOpen, setEditParticipantDialogOpen] = useState(false)
  const [editCockProfileDialogOpen, setEditCockProfileDialogOpen] = useState(false)
  const [deleteParticipantDialogOpen, setDeleteParticipantDialogOpen] = useState(false)
  const [deleteCockProfileDialogOpen, setDeleteCockProfileDialogOpen] = useState(false)
  const [addFightDialogOpen, setAddFightDialogOpen] = useState(false)
  const [editFightDialogOpen, setEditFightDialogOpen] = useState(false)
  const [deleteFightDialogOpen, setDeleteFightDialogOpen] = useState(false)

  // Selected items for editing/deleting
  const [selectedParticipant, setSelectedParticipant] = useState(null)
  const [selectedCockProfile, setSelectedCockProfile] = useState(null)
  const [selectedFight, setSelectedFight] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Form data
  const [participantFormData, setParticipantFormData] = useState({
    participantName: '',
    contactNumber: '',
    address: ''
  })

  const [cockProfileFormData, setCockProfileFormData] = useState({
    participantID: '',
    legband: '',
    weight: ''
  })

  const [fightFormData, setFightFormData] = useState({
    participant1: '',
    participant2: '',
    cockProfile1: '',
    cockProfile2: ''
  })

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useGetById('/events', eventId)

  // Fetch participants for this event
  const { data: participantsData = [], refetch: refetchParticipants } = useGetAll(`/participants?eventID=${eventId}`)

  // Fetch cock profiles for this specific event
  const { data: cockProfilesData = [], refetch: refetchCockProfiles } = useGetAll(`/cock-profiles?eventID=${eventId}`)

  // Fetch fight schedules for this event
  const { data: fightsData = [], refetch: refetchFights } = useGetAll(`/fight-schedules/event/${eventId}`)

  // Fetch available participants and their active cock profiles for this event
  const { data: availableData = {} } = useGetAll(`/fight-schedules/event/${eventId}/available-participants`)
  const participantsDataForFights = availableData.participants || []
  const cockProfilesDataForFights = availableData.cockProfiles || []

  // Mutations
  const createParticipantMutation = useCreateMutation('/participants', {
    successMessage: 'Participant registered successfully',
    errorMessage: (error) => {
      // Extract the actual error message from the backend response
      return error?.response?.data?.message || 'Failed to register participant'
    },
    onSuccess: () => {
      setAddParticipantDialogOpen(false)
      resetParticipantForm()
      refetchParticipants()
    }
  })

  const createCockProfileMutation = useCreateMutation('/cock-profiles', {
    successMessage: 'Cock profile created successfully',
    errorMessage: (error) => {
      // Extract the actual error message from the backend response
      return error?.response?.data?.message || 'Failed to create cock profile'
    },
    onSuccess: () => {
      setAddCockProfileDialogOpen(false)
      resetCockProfileForm()
      refetchCockProfiles()
    }
  })

  const updateParticipantMutation = usePutMutation('/participants', {
    successMessage: 'Participant updated successfully',
    errorMessage: (error) => {
      // Extract the actual error message from the backend response
      return error?.response?.data?.message || 'Failed to update participant'
    },
    onSuccess: () => {
      setEditParticipantDialogOpen(false)
      setSelectedParticipant(null)
      resetParticipantForm()
      refetchParticipants()
      refetchCockProfiles() // Refresh cock profiles in case participant name was changed
    }
  })

  const updateCockProfileMutation = usePutMutation('/cock-profiles', {
    successMessage: 'Cock profile updated successfully',
    errorMessage: (error) => {
      // Extract the actual error message from the backend response
      return error?.response?.data?.message || 'Failed to update cock profile'
    },
    onSuccess: () => {
      setEditCockProfileDialogOpen(false)
      setSelectedCockProfile(null)
      resetCockProfileForm()
      refetchCockProfiles()
    }
  })

  const deleteParticipantMutation = useCustomMutation(
    async ({ id }) => {
      const response = await api.delete(`/participants/${id}`)
      return response.data
    },
    {
      successMessage: (data) => {
        const cockProfilesDeleted = data?.deletedCockProfiles || 0
        if (cockProfilesDeleted > 0) {
          return `Participant deleted successfully. ${cockProfilesDeleted} associated cock profile(s) also deleted.`
        }
        return 'Participant deleted successfully'
      },
      errorMessage: 'Failed to delete participant',
      onSuccess: () => {
        setDeleteParticipantDialogOpen(false)
        setSelectedParticipant(null)
        refetchParticipants()
        refetchCockProfiles() // Also refresh cock profiles since some may have been deleted
      }
    }
  )

  const deleteCockProfileMutation = useCustomMutation(
    async ({ id }) => {
      const response = await api.delete(`/cock-profiles/${id}`)
      return response.data
    },
    {
      successMessage: 'Cock profile deleted successfully',
      errorMessage: (error) => {
        // Extract the actual error message from the backend response
        return error?.response?.data?.message || 'Failed to delete cock profile'
      },
      onSuccess: () => {
        setDeleteCockProfileDialogOpen(false)
        setSelectedCockProfile(null)
        refetchCockProfiles()
      }
    }
  )

  // Mutations for fights
  const createFightMutation = useCreateMutation('/fight-schedules', {
    successMessage: 'Fight scheduled successfully',
    errorMessage: (error) => {
      return error?.response?.data?.message || 'Failed to schedule fight'
    },
    onSuccess: () => {
      setAddFightDialogOpen(false)
      resetFightForm()
      refetchFights()
    }
  })

  const updateFightMutation = usePutMutation('/fight-schedules', {
    successMessage: 'Fight updated successfully',
    errorMessage: (error) => {
      return error?.response?.data?.message || 'Failed to update fight'
    },
    onSuccess: () => {
      setEditFightDialogOpen(false)
      setSelectedFight(null)
      resetFightForm()
      refetchFights()
    }
  })

  const deleteFightMutation = useCustomMutation(
    async ({ id }) => {
      const response = await api.delete(`/fight-schedules/${id}`)
      return response.data
    },
    {
      successMessage: 'Fight deleted successfully',
      errorMessage: (error) => {
        return error?.response?.data?.message || 'Failed to delete fight'
      },
      onSuccess: () => {
        setDeleteFightDialogOpen(false)
        setSelectedFight(null)
        refetchFights()
      }
    }
  )

  // Update state when data changes
  useEffect(() => {
    if (event && event._id && (!selectedEvent || selectedEvent._id !== event._id)) {
      setSelectedEvent(event)
    }
  }, [event, selectedEvent])



  // Use the API data directly instead of local state
  const participants = participantsData || []
  const cockProfiles = cockProfilesData || []

  // Form handlers
  const handleParticipantInputChange = (field, value) => {
    setParticipantFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCockProfileInputChange = (field, value) => {
    setCockProfileFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetParticipantForm = () => {
    setParticipantFormData({
      participantName: '',
      contactNumber: '',
      address: ''
    })
  }

  const resetCockProfileForm = () => {
    setCockProfileFormData({
      participantID: '',
      legband: '',
      weight: ''
    })
  }

  const resetFightForm = () => {
    setFightFormData({
      participant1: '',
      participant2: '',
      cockProfile1: '',
      cockProfile2: ''
    })
  }

  const handleFightInputChange = (field, value) => {
    setFightFormData(prev => ({ ...prev, [field]: value }))
  }

  // Submit handlers
  const handleAddParticipant = async () => {
    const requiredFields = ['participantName', 'contactNumber', 'address']
    const missingFields = requiredFields.filter(field => !participantFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    const participantData = {
      ...participantFormData,
      eventID: eventId
    }

    createParticipantMutation.mutate(participantData)
  }

  const handleAddCockProfile = async () => {
    const requiredFields = ['participantID']
    const missingFields = requiredFields.filter(field => !cockProfileFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    // For derby events, also require legband and weight
    if (selectedEvent?.eventType === 'derby') {
      const derbyRequiredFields = ['participantID', 'legband', 'weight']
      const derbyMissingFields = derbyRequiredFields.filter(field => !cockProfileFormData[field])

      if (derbyMissingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${derbyMissingFields.join(', ')}`)
        return
      }
    }

    const cockProfileData = {
      ...cockProfileFormData,
      eventID: eventId // Automatically set the event ID
    }

    createCockProfileMutation.mutate(cockProfileData)
  }

  const handleEditParticipant = async () => {
    if (!selectedParticipant) return

    const requiredFields = ['participantName', 'contactNumber', 'address']
    const missingFields = requiredFields.filter(field => !participantFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    const participantData = {
      ...participantFormData
    }

    updateParticipantMutation.mutate({
      id: selectedParticipant._id,
      data: participantData
    })
  }

  const handleEditCockProfile = async () => {
    if (!selectedCockProfile) return

    const requiredFields = ['participantID']
    const missingFields = requiredFields.filter(field => !cockProfileFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    // For derby events, also require legband and weight
    if (selectedEvent?.eventType === 'derby') {
      const derbyRequiredFields = ['participantID', 'legband', 'weight']
      const derbyMissingFields = derbyRequiredFields.filter(field => !cockProfileFormData[field])

      if (derbyMissingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${derbyMissingFields.join(', ')}`)
        return
      }
    }

    const cockProfileData = {
      ...cockProfileFormData
    }

    updateCockProfileMutation.mutate({
      id: selectedCockProfile._id,
      data: cockProfileData
    })
  }

  const handleDeleteParticipant = () => {
    if (!selectedParticipant) return
    deleteParticipantMutation.mutate({ id: selectedParticipant._id })
  }

  const handleDeleteCockProfile = () => {
    if (!selectedCockProfile) return
    deleteCockProfileMutation.mutate({ id: selectedCockProfile._id })
  }

  // Action handlers
  const handleEditParticipantClick = (participant) => {
    setSelectedParticipant(participant)
    setParticipantFormData({
      participantName: participant.participantName,
      contactNumber: participant.contactNumber,
      address: participant.address
    })
    setEditParticipantDialogOpen(true)
  }

  const handleEditCockProfileClick = (cockProfile) => {
    setSelectedCockProfile(cockProfile)
    setCockProfileFormData({
      participantID: cockProfile.participantID?._id || cockProfile.participantID,
      legband: cockProfile.legband || '',
      weight: cockProfile.weight || ''
    })
    setEditCockProfileDialogOpen(true)
  }

  const handleDeleteParticipantClick = (participant) => {
    setSelectedParticipant(participant)
    setDeleteParticipantDialogOpen(true)
  }

  const handleDeleteCockProfileClick = (cockProfile) => {
    setSelectedCockProfile(cockProfile)
    setDeleteCockProfileDialogOpen(true)
  }

  // Fight handlers
  const handleAddFight = async () => {
    const requiredFields = ['participant1', 'participant2', 'cockProfile1', 'cockProfile2']
    const missingFields = requiredFields.filter(field => !fightFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields`)
      return
    }

    if (fightFormData.participant1 === fightFormData.participant2) {
      toast.error('Please select different participants for the fight')
      return
    }

    if (fightFormData.cockProfile1 === fightFormData.cockProfile2) {
      toast.error('Please select different cock profiles for the fight')
      return
    }

    const fightData = {
      eventID: eventId,
      participantsID: [fightFormData.participant1, fightFormData.participant2],
      cockProfileID: [fightFormData.cockProfile1, fightFormData.cockProfile2]
    }

    createFightMutation.mutate(fightData)
  }

  const handleEditFightClick = (fight) => {
    setSelectedFight(fight)
    setFightFormData({
      participant1: fight.participantsID[0]?._id || '',
      participant2: fight.participantsID[1]?._id || '',
      cockProfile1: fight.cockProfileID[0]?._id || '',
      cockProfile2: fight.cockProfileID[1]?._id || ''
    })
    setEditFightDialogOpen(true)
  }

  const handleDeleteFightClick = (fight) => {
    setSelectedFight(fight)
    setDeleteFightDialogOpen(true)
  }

  const handleDeleteFight = () => {
    if (!selectedFight) return
    deleteFightMutation.mutate({ id: selectedFight._id })
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

  // Check if event is completed or cancelled
  const isEventCompleted = selectedEvent?.status === 'completed' || selectedEvent?.status === 'cancelled'

  // Check if registration deadline has passed for derby events
  const isRegistrationDeadlinePassed = () => {
    if (selectedEvent?.eventType === 'derby' && selectedEvent?.registrationDeadline) {
      const currentTime = new Date()
      const deadline = new Date(selectedEvent.registrationDeadline)
      return currentTime > deadline
    }
    return false
  }

  // Check if registration deadline is approaching (within 24 hours)
  const isDeadlineApproaching = () => {
    if (selectedEvent?.eventType === 'derby' && selectedEvent?.registrationDeadline) {
      const currentTime = new Date()
      const deadline = new Date(selectedEvent.registrationDeadline)
      const hoursUntilDeadline = (deadline - currentTime) / (1000 * 60 * 60)
      return hoursUntilDeadline > 0 && hoursUntilDeadline <= 24
    }
    return false
  }

  const registrationDeadlinePassed = isRegistrationDeadlinePassed()
  const deadlineApproaching = isDeadlineApproaching()

  // Create table columns
  const participantColumns = createParticipantColumns(
    handleEditParticipantClick,
    handleDeleteParticipantClick,
    handleViewDetails,
    isEventCompleted
  )

  const cockProfileColumns = createCockProfileColumns(
    handleEditCockProfileClick,
    handleDeleteCockProfileClick,
    handleViewDetails,
    isEventCompleted,
    selectedEvent?.eventType
  )

  // Create fight columns (without add result button for registration staff)
  const fightColumns = createFightColumns(
    formatCurrency,
    formatDate,
    handleEditFightClick,
    handleDeleteFightClick,
    () => { }, // No add result handler for registration staff
    handleViewDetails,
    false // Hide "Add Result" button for registration staff
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
      title={`Participant Registration - ${selectedEvent.eventName}`}
      description="Register participants and manage cock profiles for this event"
      headerButton={
        <Button variant="outline" onClick={() => navigate('/registration-staff/participant-registration')}>
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

      {/* Registration Deadline Warning */}
      {selectedEvent?.eventType === 'derby' && selectedEvent?.registrationDeadline && (
        <>
          {registrationDeadlinePassed && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Registration Deadline Has Passed
                  </p>
                  <p className="text-sm text-red-700">
                    Registration closed on {formatDate(selectedEvent.registrationDeadline)}. No new participants or cock profiles can be registered.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!registrationDeadlinePassed && deadlineApproaching && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Registration Deadline Approaching
                  </p>
                  <p className="text-sm text-orange-700">
                    Registration closes on {formatDate(selectedEvent.registrationDeadline)}. Register participants and cock profiles soon!
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Data Tabs */}
      <DataTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        participants={participants}
        cockProfiles={cockProfiles}
        participantColumns={participantColumns}
        cockProfileColumns={cockProfileColumns}
        onAddParticipant={() => setAddParticipantDialogOpen(true)}
        onAddCockProfile={() => setAddCockProfileDialogOpen(true)}
        isEventCompleted={isEventCompleted}
        registrationDeadlinePassed={registrationDeadlinePassed}
        fights={fightsData}
        fightColumns={fightColumns}
        onAddFight={() => setAddFightDialogOpen(true)}
        eventStatus={selectedEvent?.status}
      />

      {/* Add Participant Dialog */}
      <ParticipantForm
        open={addParticipantDialogOpen}
        onOpenChange={setAddParticipantDialogOpen}
        title="Register New Participant"
        description="Add a new participant for this event"
        formData={participantFormData}
        onInputChange={handleParticipantInputChange}
        onSubmit={handleAddParticipant}
        onCancel={() => setAddParticipantDialogOpen(false)}
        isPending={createParticipantMutation.isPending}
        isEdit={false}
      />

      {/* Add Cock Profile Dialog */}
      <CockProfileForm
        open={addCockProfileDialogOpen}
        onOpenChange={setAddCockProfileDialogOpen}
        title="Create New Cock Profile"
        description="Add a new cock profile with details"
        formData={cockProfileFormData}
        onInputChange={handleCockProfileInputChange}
        onSubmit={handleAddCockProfile}
        onCancel={() => setAddCockProfileDialogOpen(false)}
        isPending={createCockProfileMutation.isPending}
        isEdit={false}
        eventId={eventId}
      />

      {/* Edit Participant Dialog */}
      <ParticipantForm
        open={editParticipantDialogOpen}
        onOpenChange={setEditParticipantDialogOpen}
        title="Edit Participant"
        description="Update participant information"
        formData={participantFormData}
        onInputChange={handleParticipantInputChange}
        onSubmit={handleEditParticipant}
        onCancel={() => setEditParticipantDialogOpen(false)}
        isPending={updateParticipantMutation.isPending}
        isEdit={true}
      />

      {/* Edit Cock Profile Dialog */}
      <CockProfileForm
        open={editCockProfileDialogOpen}
        onOpenChange={setEditCockProfileDialogOpen}
        title="Edit Cock Profile"
        description="Update cock profile information"
        formData={cockProfileFormData}
        onInputChange={handleCockProfileInputChange}
        onSubmit={handleEditCockProfile}
        onCancel={() => setEditCockProfileDialogOpen(false)}
        isPending={updateCockProfileMutation.isPending}
        isEdit={true}
        eventId={eventId}
      />

      {/* Delete Participant Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteParticipantDialogOpen}
        onOpenChange={setDeleteParticipantDialogOpen}
        title="Delete Participant"
        description={`Are you sure you want to delete "${selectedParticipant?.participantName}"? This action cannot be undone.`}
        confirmText="Delete Participant"
        cancelText="Cancel"
        onConfirm={handleDeleteParticipant}
        onCancel={() => setDeleteParticipantDialogOpen(false)}
        variant="destructive"
        loading={deleteParticipantMutation.isPending}
      />

      {/* Delete Cock Profile Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteCockProfileDialogOpen}
        onOpenChange={setDeleteCockProfileDialogOpen}
        title="Delete Cock Profile"
        description={`Are you sure you want to delete the cock profile with entry number "${selectedCockProfile?.entryNo}"? This action cannot be undone.`}
        confirmText="Delete Profile"
        cancelText="Cancel"
        onConfirm={handleDeleteCockProfile}
        onCancel={() => setDeleteCockProfileDialogOpen(false)}
        variant="destructive"
        loading={deleteCockProfileMutation.isPending}
      />

      {/* Add Fight Dialog */}
      <FightForm
        open={addFightDialogOpen}
        onOpenChange={setAddFightDialogOpen}
        title="Schedule New Fight"
        description="Create a new fight schedule"
        formData={fightFormData}
        onInputChange={handleFightInputChange}
        onSubmit={handleAddFight}
        onCancel={() => setAddFightDialogOpen(false)}
        isPending={createFightMutation.isPending}
        availableParticipants={participantsDataForFights}
        availableCockProfiles={cockProfilesDataForFights}
        isEdit={false}
        event={selectedEvent}
      />

      {/* Edit Fight Dialog */}
      <FightForm
        open={editFightDialogOpen}
        onOpenChange={setEditFightDialogOpen}
        title="Edit Fight Schedule"
        description="Update fight schedule details"
        formData={fightFormData}
        onInputChange={handleFightInputChange}
        onSubmit={() => {
          if (!selectedFight) return
          const fightData = {}
          updateFightMutation.mutate({ id: selectedFight._id, data: fightData })
        }}
        onCancel={() => setEditFightDialogOpen(false)}
        isPending={updateFightMutation.isPending}
        availableParticipants={participantsDataForFights}
        availableCockProfiles={cockProfilesDataForFights}
        isEdit={true}
        event={selectedEvent}
        selectedFight={selectedFight}
      />

      {/* Delete Fight Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteFightDialogOpen}
        onOpenChange={setDeleteFightDialogOpen}
        title="Delete Fight"
        description={`Are you sure you want to delete Fight #${selectedFight?.fightNumber}? This action cannot be undone.`}
        confirmText="Delete Fight"
        cancelText="Cancel"
        onConfirm={handleDeleteFight}
        onCancel={() => setDeleteFightDialogOpen(false)}
        variant="destructive"
        loading={deleteFightMutation.isPending}
      />

      {/* Detail View Dialog */}
      <CustomAlertDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        title={`${selectedItem?.type === 'participant' ? 'Participant' : selectedItem?.type === 'cockProfile' ? 'Cock Profile' : 'Fight'} Details`}
        description={`Detailed information for ${selectedItem?.type === 'participant' ? 'this participant' : selectedItem?.type === 'cockProfile' ? 'this cock profile' : 'this fight'}`}
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
                          <p className="text-sm font-medium text-gray-600 mb-1">Legband</p>
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
              </div>
            )}

            {selectedItem.type === 'fight' && (
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
                            <p className="mt-1 text-sm text-gray-900">#{cock.entryNo || cock.legband || 'N/A'}</p>
                          </div>

                          {/* Leg Band and Weight - only shown for derby events */}
                          {selectedEvent?.eventType === 'derby' && (
                            <>
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Leg Band</label>
                                <p className="mt-1 text-sm text-gray-900">{cock.legband || 'N/A'}</p>
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Weight</label>
                                <p className="mt-1 text-sm text-gray-900">{cock.weight ? `${cock.weight}kg` : 'N/A'}</p>
                              </div>
                            </>
                          )}

                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                            <div className="mt-1">
                              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${cock.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {cock.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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

export default ParticipantRegistration
