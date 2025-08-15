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
    location: '',
    date: '',
    prize: '',
    entryFee: '',
    minimumBet: '',
    eventType: '',
    noCockRequirements: '',
    description: '',
    maxParticipants: '',
    registrationDeadline: '',
    isPublic: true
  })
  const [editFormData, setEditFormData] = useState({
    eventName: '',
    location: '',
    date: '',
    prize: '',
    entryFee: '',
    minimumBet: '',
    eventType: '',
    noCockRequirements: '',
    description: '',
    maxParticipants: '',
    registrationDeadline: '',
    isPublic: true
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
    const basicRequiredFields = ['eventName', 'location', 'date', 'entryFee', 'eventType']
    const missingBasicFields = basicRequiredFields.filter(field => !formData[field])

    if (missingBasicFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingBasicFields.join(', ')}`)
      return
    }

    // Additional required fields for non-regular events
    if (formData.eventType !== 'regular') {
      const additionalRequiredFields = ['prize', 'minimumBet', 'noCockRequirements']
      const missingAdditionalFields = additionalRequiredFields.filter(field => !formData[field])

      if (missingAdditionalFields.length > 0) {
        toast.error(`For ${formData.eventType} events, please fill in: ${missingAdditionalFields.join(', ')}`)
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
    const numericFields = ['entryFee']
    if (formData.eventType !== 'regular') {
      numericFields.push('prize', 'minimumBet', 'noCockRequirements')
    }

    for (const field of numericFields) {
      if (isNaN(formData[field]) || Number(formData[field]) < 0) {
        toast.error(`${field} must be a valid positive number`)
        return
      }
    }

    // Validate maxParticipants if provided
    if (formData.maxParticipants && (isNaN(formData.maxParticipants) || Number(formData.maxParticipants) < 1)) {
      toast.error('Max participants must be a valid positive number')
      return
    }

    createEventMutation.mutate(formData)
  }

  const handleEditEvent = async () => {
    // Basic required fields for all events
    const basicRequiredFields = ['eventName', 'location', 'date', 'entryFee', 'eventType']
    const missingBasicFields = basicRequiredFields.filter(field => !editFormData[field])

    if (missingBasicFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingBasicFields.join(', ')}`)
      return
    }

    // Additional required fields for non-regular events
    if (editFormData.eventType !== 'regular') {
      const additionalRequiredFields = ['prize', 'minimumBet', 'noCockRequirements']
      const missingAdditionalFields = additionalRequiredFields.filter(field => !editFormData[field])

      if (missingAdditionalFields.length > 0) {
        toast.error(`For ${editFormData.eventType} events, please fill in: ${missingAdditionalFields.join(', ')}`)
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
    const numericFields = ['entryFee']
    if (editFormData.eventType !== 'regular') {
      numericFields.push('prize', 'minimumBet', 'noCockRequirements')
    }

    for (const field of numericFields) {
      if (isNaN(editFormData[field]) || Number(editFormData[field]) < 0) {
        toast.error(`${field} must be a valid positive number`)
        return
      }
    }

    // Validate maxParticipants if provided
    if (editFormData.maxParticipants && (isNaN(editFormData.maxParticipants) || Number(editFormData.maxParticipants) < 1)) {
      toast.error('Max participants must be a valid positive number')
      return
    }

    updateEventMutation.mutate({
      id: selectedEvent._id,
      data: editFormData
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
      location: '',
      date: '',
      prize: '',
      entryFee: '',
      minimumBet: '',
      eventType: '',
      noCockRequirements: '',
      description: '',
      maxParticipants: '',
      registrationDeadline: '',
      isPublic: true
    })
  }

  const resetEditForm = () => {
    setEditFormData({
      eventName: '',
      location: '',
      date: '',
      prize: '',
      entryFee: '',
      minimumBet: '',
      eventType: '',
      noCockRequirements: '',
      description: '',
      maxParticipants: '',
      registrationDeadline: '',
      isPublic: true
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

  // Action handlers
  const handleEditEventClick = (event) => {
    setSelectedEvent(event)
    setEditFormData({
      eventName: event.eventName,
      location: event.location,
      date: new Date(event.date).toISOString().slice(0, 16),
      prize: event.prize.toString(),
      entryFee: event.entryFee.toString(),
      minimumBet: event.minimumBet.toString(),
      eventType: event.eventType,
      noCockRequirements: event.noCockRequirements.toString(),
      description: event.description || '',
      maxParticipants: event.maxParticipants?.toString() || '',
      registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : '',
      isPublic: event.isPublic
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
