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
  const [selectedItem, setSelectedItem] = useState(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Form data
  const [participantFormData, setParticipantFormData] = useState({
    participantName: '',
    contactNumber: '',
    address: ''
  })

  const [cockProfileFormData, setCockProfileFormData] = useState({
    entryNo: '',
    participantID: '',
    legband: '',
    weight: ''
  })

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useGetById('/events', eventId)

  // Fetch participants for this event
  const { data: participantsData = [], refetch: refetchParticipants } = useGetAll(`/participants?eventID=${eventId}`)

  // Fetch cock profiles for this specific event
  const { data: cockProfilesData = [], refetch: refetchCockProfiles } = useGetAll(`/cock-profiles?eventID=${eventId}`)

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
      entryNo: '',
      participantID: '',
      legband: '',
      weight: ''
    })
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
    const requiredFields = ['entryNo', 'participantID']
    const missingFields = requiredFields.filter(field => !cockProfileFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    // For derby events, also require legband and weight
    if (selectedEvent?.eventType === 'derby') {
      const derbyRequiredFields = ['entryNo', 'participantID', 'legband', 'weight']
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

    const requiredFields = ['entryNo', 'participantID']
    const missingFields = requiredFields.filter(field => !cockProfileFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    // For derby events, also require legband and weight
    if (selectedEvent?.eventType === 'derby') {
      const derbyRequiredFields = ['entryNo', 'participantID', 'legband', 'weight']
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
      entryNo: cockProfile.entryNo,
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

       {/* Detail View Dialog */}
       <CustomAlertDialog
         open={detailDialogOpen}
         onOpenChange={setDetailDialogOpen}
         title={`${selectedItem?.type === 'participant' ? 'Participant' : 'Cock Profile'} Details`}
         description={`Detailed information for ${selectedItem?.type === 'participant' ? 'this participant' : 'this cock profile'}`}
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
                   <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                     selectedItem.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                   }`}>
                     {selectedItem.isActive ? 'Active' : 'Inactive'}
                   </span>
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
