import React, { useState } from 'react'
import DataTable from '@/components/custom/DataTable'
import ConfirmationDialog from '@/components/custom/ConfirmationDialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { toast } from 'sonner'
import { useGetAll } from '@/hooks/useApiQueries'
import { useCreateMutation, usePutMutation, useCustomMutation } from '@/hooks/useApiMutations'
import api from '@/services/api'

// Import custom components
import EventForm from './components/EventForm'
import { createEventColumns } from './components/EventTableColumns'
import { useNavigate } from 'react-router-dom'

const Events = () => {
  const navigate = useNavigate()
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false)
  const [editEventDialogOpen, setEditEventDialogOpen] = useState(false)
  const [deleteEventDialogOpen, setDeleteEventDialogOpen] = useState(false)
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false)

  const [selectedEvent, setSelectedEvent] = useState(null)
  const [pendingStatusChange, setPendingStatusChange] = useState(null) // { eventId, newStatus, oldStatus, event }
  const [formData, setFormData] = useState({
    eventName: '',
    date: '',
    minimumBet: '',
    minimumParticipants: '',
    prize: '',
    eventType: '',
    noCockRequirements: '',
    registrationDeadline: '',
    entranceFee: '',
    entryFee: '',
    cageRentalFee: '',
    minWeight: '',
    maxWeight: '',
    weightGap: '',
    winnerCount: ''
  })
  const [editFormData, setEditFormData] = useState({
    eventName: '',
    date: '',
    minimumBet: '',
    minimumParticipants: '',
    prize: '',
    eventType: '',
    noCockRequirements: '',
    registrationDeadline: '',
    entranceFee: '',
    entryFee: '',
    cageRentalFee: '',
    minWeight: '',
    maxWeight: '',
    weightGap: '',
    winnerCount: ''
  })

  // Fetch events with general hook
  const { data: events = [], isLoading, error, refetch } = useGetAll('/events')

  // Handle query error
  React.useEffect(() => {
    if (error) {
      toast.error('Failed to fetch events')
    }
  }, [error])

  // Create event mutation with general hook
  const createEventMutation = useCreateMutation('/events', {
    successMessage: 'Event created successfully',
    errorMessage: (error) => {
      // Extract the actual error message from the backend response
      return error?.response?.data?.message || 'Failed to create event'
    },
    queryKey: ['/events'],
    onSuccess: () => {
      handleDialogClose()
      refetch()
    },
  })

  // Update event mutation with general hook
  const updateEventMutation = usePutMutation('/events', {
    successMessage: 'Event updated successfully',
    errorMessage: (error) => {
      // Extract the actual error message from the backend response
      return error?.response?.data?.message || 'Failed to update event'
    },
    queryKey: ['/events'],
    onSuccess: () => {
      handleEditDialogClose()
      refetch()
    },
  })

  // Delete event mutation
  const deleteEventMutation = useCustomMutation(
    async ({ id }) => {
      const response = await api.delete(`/events/${id}`)
      return response.data
    },
    {
      successMessage: 'Event deleted successfully',
      errorMessage: (error) => {
        // Extract the actual error message from the backend response
        return error?.response?.data?.message || 'Failed to delete event'
      },
      queryKey: ['/events'],
      onSuccess: () => {
        setDeleteEventDialogOpen(false)
        setSelectedEvent(null)
        refetch()
      },
    }
  )

  // Status change mutation
  const statusChangeMutation = useCustomMutation(
    async ({ id, status }) => {
      const response = await api.patch(`/events/${id}/status`, { status })
      return response.data
    },
    {
      successMessage: 'Event status updated successfully',
      errorMessage: (error) => {
        // Extract the actual error message from the backend response
        return error?.response?.data?.message || 'Failed to update event status'
      },
      queryKey: ['/events'],
      onSuccess: () => {
        setStatusChangeDialogOpen(false)
        setPendingStatusChange(null)
        refetch()
      },
    }
  )



  const handleAddEvent = async () => {
    // Basic required fields for all events
    const basicRequiredFields = ['eventName', 'date', 'eventType', 'entranceFee', 'cageRentalFee', 'minimumBet', 'minimumParticipants']
    const missingBasicFields = basicRequiredFields.filter(field => !formData[field])

    if (missingBasicFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingBasicFields.join(', ')}`)
      return
    }

    // Additional required fields for derby events
    if (formData.eventType === 'derby') {
      const additionalRequiredFields = ['prize', 'noCockRequirements', 'registrationDeadline', 'minWeight', 'maxWeight', 'weightGap']
      const missingAdditionalFields = additionalRequiredFields.filter(field => !formData[field])

      if (missingAdditionalFields.length > 0) {
        toast.error(`For derby events, please fill in: ${missingAdditionalFields.join(', ')}`)
        return
      }
    }

    // Additional required fields for hits_ulutan events (no registrationDeadline)
    if (formData.eventType === 'hits_ulutan') {
      const additionalRequiredFields = ['prize', 'noCockRequirements']
      const missingAdditionalFields = additionalRequiredFields.filter(field => !formData[field])

      if (missingAdditionalFields.length > 0) {
        toast.error(`For hits ulutan events, please fill in: ${missingAdditionalFields.join(', ')}`)
        return
      }
    }

    // Additional required fields for fastest_kill events
    if (formData.eventType === 'fastest_kill') {
      const additionalRequiredFields = ['prize', 'winnerCount']
      const missingAdditionalFields = additionalRequiredFields.filter(field => !formData[field])

      if (missingAdditionalFields.length > 0) {
        toast.error(`For fastest kill events, please fill in: ${missingAdditionalFields.join(', ')}`)
        return
      }
    }

    // Validate date is in the future
    const eventDate = new Date(formData.date)
    if (eventDate <= new Date()) {
      toast.error('Event date must be in the future')
      return
    }

    // Validate numeric fields
    const numericFields = ['entranceFee', 'cageRentalFee', 'minimumBet', 'minimumParticipants']
    if (formData.entryFee) {
      numericFields.push('entryFee')
    }
    if (formData.eventType === 'derby' || formData.eventType === 'hits_ulutan') {
      numericFields.push('prize', 'noCockRequirements')
    }
    if (formData.eventType === 'derby') {
      numericFields.push('minWeight', 'maxWeight', 'weightGap')
    }
    if (formData.eventType === 'fastest_kill') {
      numericFields.push('prize', 'winnerCount')
    }

    for (const field of numericFields) {
      if (formData[field] && (isNaN(formData[field]) || Number(formData[field]) < 0)) {
        toast.error(`${field} must be a valid positive number`)
        return
      }
    }

    // Prepare data for create - remove fields that shouldn't be sent for regular events
    const createData = { ...formData }

    // Convert date to ISO string to preserve absolute time
    if (createData.date) {
      createData.date = new Date(createData.date).toISOString()
    }

    // Convert registrationDeadline to ISO string if present
    if (createData.registrationDeadline) {
      createData.registrationDeadline = new Date(createData.registrationDeadline).toISOString()
    }

    // Handle entryFee - convert to number if provided, otherwise set to null
    if (createData.entryFee && createData.entryFee !== '') {
      createData.entryFee = Number(createData.entryFee)
    } else {
      createData.entryFee = null
    }

    // For regular events, remove the fields that are not required
    if (formData.eventType === 'regular') {
      delete createData.prize
      delete createData.noCockRequirements
      delete createData.registrationDeadline
      delete createData.minWeight
      delete createData.maxWeight
      delete createData.weightGap
      delete createData.winnerCount
    }

    // For non-derby events, remove derby-specific fields
    if (formData.eventType !== 'derby') {
      delete createData.minWeight
      delete createData.maxWeight
      delete createData.registrationDeadline
    }

    // For non-fastest_kill events, remove fastest kill-specific fields
    if (formData.eventType !== 'fastest_kill') {
      delete createData.winnerCount
    }

    // For non-derby and non-hits_ulutan events, remove noCockRequirements
    if (formData.eventType !== 'derby' && formData.eventType !== 'hits_ulutan') {
      delete createData.noCockRequirements
    }

    createEventMutation.mutate(createData)
  }

  const handleEditEvent = async () => {
    // Basic required fields for all events
    const basicRequiredFields = ['eventName', 'date', 'eventType', 'entranceFee', 'cageRentalFee', 'minimumBet', 'minimumParticipants']
    const missingBasicFields = basicRequiredFields.filter(field => !editFormData[field])

    if (missingBasicFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingBasicFields.join(', ')}`)
      return
    }

    // Additional required fields for derby events
    if (editFormData.eventType === 'derby') {
      const additionalRequiredFields = ['prize', 'noCockRequirements', 'registrationDeadline', 'minWeight', 'maxWeight', 'weightGap']
      const missingAdditionalFields = additionalRequiredFields.filter(field => !editFormData[field])

      if (missingAdditionalFields.length > 0) {
        toast.error(`For derby events, please fill in: ${missingAdditionalFields.join(', ')}`)
        return
      }
    }

    // Additional required fields for hits_ulutan events (no registrationDeadline)
    if (editFormData.eventType === 'hits_ulutan') {
      const additionalRequiredFields = ['prize', 'noCockRequirements']
      const missingAdditionalFields = additionalRequiredFields.filter(field => !editFormData[field])

      if (missingAdditionalFields.length > 0) {
        toast.error(`For hits ulutan events, please fill in: ${missingAdditionalFields.join(', ')}`)
        return
      }
    }

    // Additional required fields for fastest_kill events
    if (editFormData.eventType === 'fastest_kill') {
      const additionalRequiredFields = ['prize', 'winnerCount']
      const missingAdditionalFields = additionalRequiredFields.filter(field => !editFormData[field])

      if (missingAdditionalFields.length > 0) {
        toast.error(`For fastest kill events, please fill in: ${missingAdditionalFields.join(', ')}`)
        return
      }
    }

    if (!selectedEvent) return

    // Validate date is in the future
    const eventDate = new Date(editFormData.date)
    if (eventDate <= new Date()) {
      toast.error('Event date must be in the future')
      return
    }

    // Validate numeric fields
    const numericFields = ['entranceFee', 'cageRentalFee', 'minimumBet', 'minimumParticipants']
    if (editFormData.entryFee) {
      numericFields.push('entryFee')
    }
    if (editFormData.eventType === 'derby' || editFormData.eventType === 'hits_ulutan') {
      numericFields.push('prize', 'noCockRequirements')
    }
    if (editFormData.eventType === 'derby') {
      numericFields.push('minWeight', 'maxWeight', 'weightGap')
    }
    if (editFormData.eventType === 'fastest_kill') {
      numericFields.push('prize', 'winnerCount')
    }

    for (const field of numericFields) {
      if (editFormData[field] && (isNaN(editFormData[field]) || Number(editFormData[field]) < 0)) {
        toast.error(`${field} must be a valid positive number`)
        return
      }
    }

    // Prepare data for update - remove fields that shouldn't be sent for regular events
    const updateData = { ...editFormData }

    // Convert date to ISO string to preserve absolute time
    if (updateData.date) {
      updateData.date = new Date(updateData.date).toISOString()
    }

    // Convert registrationDeadline to ISO string if present
    if (updateData.registrationDeadline) {
      updateData.registrationDeadline = new Date(updateData.registrationDeadline).toISOString()
    }

    // Handle entryFee - convert to number if provided, otherwise set to null
    if (updateData.entryFee && updateData.entryFee !== '') {
      updateData.entryFee = Number(updateData.entryFee)
    } else {
      updateData.entryFee = null
    }

    // For regular events, remove the fields that are not required
    if (editFormData.eventType === 'regular') {
      delete updateData.prize
      delete updateData.noCockRequirements
      delete updateData.registrationDeadline
      delete updateData.minWeight
      delete updateData.maxWeight
      delete updateData.weightGap
      delete updateData.winnerCount
    }

    // For non-derby events, remove derby-specific fields
    if (editFormData.eventType !== 'derby') {
      delete updateData.minWeight
      delete updateData.maxWeight
      delete updateData.registrationDeadline
    }

    // For non-fastest_kill events, remove fastest kill-specific fields
    if (editFormData.eventType !== 'fastest_kill') {
      delete updateData.winnerCount
    }

    // For non-derby and non-hits_ulutan events, remove noCockRequirements
    if (editFormData.eventType !== 'derby' && editFormData.eventType !== 'hits_ulutan') {
      delete updateData.noCockRequirements
    }

    updateEventMutation.mutate({
      id: selectedEvent._id,
      data: updateData
    })
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      eventName: '',
      date: '',
      minimumBet: '',
      minimumParticipants: '',
      prize: '',
      eventType: '',
      noCockRequirements: '',
      registrationDeadline: '',
      entranceFee: '',
      entryFee: '',
      cageRentalFee: '',
      minWeight: '',
      maxWeight: '',
      weightGap: '',
      winnerCount: ''
    })
  }

  const resetEditForm = () => {
    setEditFormData({
      eventName: '',
      date: '',
      minimumBet: '',
      minimumParticipants: '',
      prize: '',
      eventType: '',
      noCockRequirements: '',
      registrationDeadline: '',
      entranceFee: '',
      entryFee: '',
      cageRentalFee: '',
      minWeight: '',
      maxWeight: '',
      weightGap: '',
      winnerCount: ''
    })
  }

  const handleDialogClose = () => {
    setAddEventDialogOpen(false)
    resetForm()
  }

  const handleEditDialogClose = () => {
    setEditEventDialogOpen(false)
    setSelectedEvent(null)
    resetEditForm()
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return
    deleteEventMutation.mutate({ id: selectedEvent._id })
  }

  const handleStatusChange = (eventId, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return

    // Validation: Prevent reverting from completed or cancelled status
    if ((currentStatus === 'completed' || currentStatus === 'cancelled') &&
      newStatus === 'active') {
      toast.error(`Cannot change status from ${currentStatus} back to ${newStatus}`)
      return
    }

    // Find the event to get more context for the confirmation
    const event = events.find(e => e._id === eventId)

    setPendingStatusChange({
      eventId,
      newStatus,
      currentStatus,
      event
    })
    setStatusChangeDialogOpen(true)
  }

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      statusChangeMutation.mutate({
        id: pendingStatusChange.eventId,
        status: pendingStatusChange.newStatus
      })
    }
  }

  const cancelStatusChange = () => {
    setStatusChangeDialogOpen(false)
    setPendingStatusChange(null)
  }



  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  // Helper function to format date for datetime-local input without timezone conversion
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Get local date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    // Return in format: YYYY-MM-DDTHH:mm
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Action handlers
  const handleEditEventClick = (event) => {
    setSelectedEvent(event)
    setEditFormData({
      eventName: event.eventName || '',
      date: formatDateForInput(event.date),
      minimumBet: event.minimumBet ? event.minimumBet.toString() : '',
      minimumParticipants: event.minimumParticipants ? event.minimumParticipants.toString() : '',
      prize: event.prize ? event.prize.toString() : '',
      eventType: event.eventType || '',
      noCockRequirements: event.noCockRequirements ? event.noCockRequirements.toString() : '',
      registrationDeadline: formatDateForInput(event.registrationDeadline),
      entranceFee: event.entranceFee ? event.entranceFee.toString() : '',
      entryFee: event.entryFee ? event.entryFee.toString() : '',
      cageRentalFee: event.cageRentalFee ? event.cageRentalFee.toString() : '',
      minWeight: event.minWeight ? event.minWeight.toString() : '',
      maxWeight: event.maxWeight ? event.maxWeight.toString() : '',
      weightGap: event.weightGap ? event.weightGap.toString() : '',
      winnerCount: event.winnerCount ? event.winnerCount.toString() : ''
    })
    setEditEventDialogOpen(true)
  }

  const handleDeleteEventClick = (event) => {
    setSelectedEvent(event)
    setDeleteEventDialogOpen(true)
  }

  const handleRowClick = (event) => {
    navigate(`/admin/events/${event._id}`)
  }



  // Create table columns after all handlers are defined
  const columns = createEventColumns(
    formatCurrency,
    formatDate,
    handleEditEventClick,
    handleDeleteEventClick,
    handleStatusChange,
    statusChangeMutation
  )

  return (
    <PageLayout
      title="Event Management"
      description="Manage cockfighting events, schedules, and details"
      headerButton={
        <Button onClick={() => setAddEventDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      }
    >
      {/* Add Event Dialog */}
      <EventForm
        open={addEventDialogOpen}
        onOpenChange={setAddEventDialogOpen}
        title="Add New Event"
        description="Create a new cockfighting event with all necessary details."
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleAddEvent}
        onCancel={handleDialogClose}
        isPending={createEventMutation.isPending}
        isEdit={false}
      />

      {/* Edit Event Dialog */}
      <EventForm
        open={editEventDialogOpen}
        onOpenChange={setEditEventDialogOpen}
        title="Edit Event"
        description="Update event information and details."
        formData={editFormData}
        onInputChange={handleEditInputChange}
        onSubmit={handleEditEvent}
        onCancel={handleEditDialogClose}
        isPending={updateEventMutation.isPending}
        isEdit={true}
      />

      {/* Delete Event Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteEventDialogOpen}
        onOpenChange={setDeleteEventDialogOpen}
        title="Delete Event"
        description={`Are you sure you want to delete "${selectedEvent?.eventName}"? This action cannot be undone.`}
        confirmText="Delete Event"
        onConfirm={handleDeleteEvent}
        onCancel={() => {
          setDeleteEventDialogOpen(false)
          setSelectedEvent(null)
        }}
        variant="destructive"
        loading={deleteEventMutation.isPending}
      />

      {/* Status Change Confirmation Dialog */}
      <ConfirmationDialog
        open={statusChangeDialogOpen}
        onOpenChange={setStatusChangeDialogOpen}
        title="Change Event Status"
        description={
          pendingStatusChange
            ? `Are you sure you want to change the status of "${pendingStatusChange.event?.eventName}" from "${pendingStatusChange.currentStatus}" to "${pendingStatusChange.newStatus}"?`
            : "Are you sure you want to change the event status?"
        }
        confirmText="Change Status"
        cancelText="Cancel"
        onConfirm={confirmStatusChange}
        onCancel={cancelStatusChange}
        variant="default"
        loading={statusChangeMutation.isPending}
      />

      {/* Data Table */}
      <DataTable
        data={events}
        columns={columns}
        pageSize={10}
        searchable={true}
        filterable={true}
        title="Events"
        onRowClick={handleRowClick}
        loading={isLoading}
        emptyMessage="No events found"
        className="shadow-sm"
      />
    </PageLayout>
  )
}

export default Events
