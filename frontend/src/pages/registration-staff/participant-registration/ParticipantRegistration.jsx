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

// Import custom components
import EventDetailsCard from './components/EventDetailsCard'
import ParticipantForm from './components/ParticipantForm'
import CockProfileForm from './components/CockProfileForm'
import DataTabs from './components/DataTabs'
import { createParticipantColumns, createCockProfileColumns } from './components/TableColumns'

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

  // Selected items for editing/deleting
  const [selectedParticipant, setSelectedParticipant] = useState(null)
  const [selectedCockProfile, setSelectedCockProfile] = useState(null)

  // Form data
  const [participantFormData, setParticipantFormData] = useState({
    participantName: '',
    contactNumber: '',
    email: '',
    address: '',
    entryFee: '',
    matchWinRequirements: '',
    eventType: '',
    notes: ''
  })

  const [cockProfileFormData, setCockProfileFormData] = useState({
    weight: '',
    legband: '',
    entryNo: '',
    ownerName: '',
    notes: ''
  })

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useGetById('/events', eventId)

  // Fetch participants for this event
  const { data: participantsData = [], refetch: refetchParticipants } = useGetAll(`/participants?eventID=${eventId}`)

  // Fetch cock profiles
  const { data: cockProfilesData = [], refetch: refetchCockProfiles } = useGetAll('/cock-profiles')

  // Mutations
  const createParticipantMutation = useCreateMutation('/participants', {
    successMessage: 'Participant registered successfully',
    errorMessage: 'Failed to register participant',
    onSuccess: () => {
      setAddParticipantDialogOpen(false)
      resetParticipantForm()
      refetchParticipants()
    }
  })

  const createCockProfileMutation = useCreateMutation('/cock-profiles', {
    successMessage: 'Cock profile created successfully',
    errorMessage: 'Failed to create cock profile',
    onSuccess: () => {
      setAddCockProfileDialogOpen(false)
      resetCockProfileForm()
      refetchCockProfiles()
    }
  })

  const updateParticipantMutation = usePutMutation('/participants', {
    successMessage: 'Participant updated successfully',
    errorMessage: 'Failed to update participant',
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
    errorMessage: 'Failed to update cock profile',
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
      errorMessage: 'Failed to delete cock profile',
      onSuccess: () => {
        setDeleteCockProfileDialogOpen(false)
        setSelectedCockProfile(null)
        refetchCockProfiles()
      }
    }
  )

  // Update state when data changes
  useEffect(() => {
    if (event && event._id && (!selectedEvent || selectedEvent._id !== event._id)) {
      setSelectedEvent(event)
    }
  }, [event, selectedEvent])

  // Set default form values when selectedEvent changes
  useEffect(() => {
    if (selectedEvent && selectedEvent._id) {
      setParticipantFormData(prev => {
        const newEntryFee = selectedEvent.entryFee?.toString() || ''
        const newEventType = selectedEvent.eventType || ''
        const newMatchWinRequirements = selectedEvent.noCockRequirements?.toString() || ''

        // Only update if values have actually changed
        if (prev.entryFee !== newEntryFee ||
            prev.eventType !== newEventType ||
            prev.matchWinRequirements !== newMatchWinRequirements) {
          return {
            ...prev,
            entryFee: newEntryFee,
            eventType: newEventType,
            matchWinRequirements: newMatchWinRequirements
          }
        }
        return prev
      })
    }
  }, [selectedEvent?._id, selectedEvent?.entryFee, selectedEvent?.eventType, selectedEvent?.noCockRequirements])

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
      email: '',
      address: '',
      entryFee: selectedEvent?.entryFee?.toString() || '',
      matchWinRequirements: selectedEvent?.noCockRequirements?.toString() || '',
      eventType: selectedEvent?.eventType || '',
      notes: ''
    })
  }

  const resetCockProfileForm = () => {
    setCockProfileFormData({
      weight: '',
      legband: '',
      entryNo: '',
      ownerName: '',
      notes: ''
    })
  }

  // Submit handlers
  const handleAddParticipant = async () => {
    const requiredFields = ['participantName', 'contactNumber', 'email', 'address', 'entryFee', 'matchWinRequirements', 'eventType']
    const missingFields = requiredFields.filter(field => !participantFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    const participantData = {
      ...participantFormData,
      eventID: eventId,
      entryFee: parseFloat(participantFormData.entryFee),
      matchWinRequirements: parseInt(participantFormData.matchWinRequirements)
    }

    createParticipantMutation.mutate(participantData)
  }

  const handleAddCockProfile = async () => {
    const requiredFields = ['weight', 'legband', 'entryNo', 'ownerName']
    const missingFields = requiredFields.filter(field => !cockProfileFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    const cockProfileData = {
      ...cockProfileFormData,
      weight: parseFloat(cockProfileFormData.weight)
    }

    createCockProfileMutation.mutate(cockProfileData)
  }

  const handleEditParticipant = async () => {
    if (!selectedParticipant) return

    const requiredFields = ['participantName', 'contactNumber', 'email', 'address', 'entryFee', 'matchWinRequirements', 'eventType']
    const missingFields = requiredFields.filter(field => !participantFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    const participantData = {
      ...participantFormData,
      entryFee: parseFloat(participantFormData.entryFee),
      matchWinRequirements: parseInt(participantFormData.matchWinRequirements)
    }

    updateParticipantMutation.mutate({
      id: selectedParticipant._id,
      data: participantData
    })
  }

  const handleEditCockProfile = async () => {
    if (!selectedCockProfile) return

    const requiredFields = ['weight', 'legband', 'entryNo', 'ownerName']
    const missingFields = requiredFields.filter(field => !cockProfileFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    const cockProfileData = {
      ...cockProfileFormData,
      weight: parseFloat(cockProfileFormData.weight)
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
      email: participant.email,
      address: participant.address,
      entryFee: participant.entryFee.toString(),
      matchWinRequirements: participant.matchWinRequirements.toString(),
      eventType: participant.eventType,
      notes: participant.notes || ''
    })
    setEditParticipantDialogOpen(true)
  }

  const handleEditCockProfileClick = (cockProfile) => {
    setSelectedCockProfile(cockProfile)
    setCockProfileFormData({
      weight: cockProfile.weight.toString(),
      legband: cockProfile.legband,
      entryNo: cockProfile.entryNo,
      ownerName: cockProfile.ownerName,
      notes: cockProfile.notes || ''
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

  // Create table columns
  const participantColumns = createParticipantColumns(
    formatCurrency,
    handleEditParticipantClick,
    handleDeleteParticipantClick,
    isEventCompleted
  )

  const cockProfileColumns = createCockProfileColumns(
    handleEditCockProfileClick,
    handleDeleteCockProfileClick,
    isEventCompleted
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
        <Button variant="outline" onClick={() => navigate('/event-staff/events')}>
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
        participants={participants}
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
        participants={participants}
        isEdit={false}
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
        participants={participants}
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
        participants={participants}
        isEdit={true}
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
        description={`Are you sure you want to delete the cock profile with legband "${selectedCockProfile?.legband}"? This action cannot be undone.`}
        confirmText="Delete Profile"
        cancelText="Cancel"
        onConfirm={handleDeleteCockProfile}
        onCancel={() => setDeleteCockProfileDialogOpen(false)}
        variant="destructive"
        loading={deleteCockProfileMutation.isPending}
      />
    </PageLayout>
  )
}

export default ParticipantRegistration
