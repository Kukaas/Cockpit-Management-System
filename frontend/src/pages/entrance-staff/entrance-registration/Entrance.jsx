import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { toast } from 'sonner'
import { useGetAll, useGetById } from '@/hooks/useApiQueries'
import { useCreateMutation, usePutMutation, useCustomMutation } from '@/hooks/useApiMutations'
import api from '@/services/api'
import ConfirmationDialog from '@/components/custom/ConfirmationDialog'
import DataTable from '@/components/custom/DataTable'

// Import custom components
import EventDetailsCard from './components/EventDetailsCard'
import EntranceForm from './components/EntranceForm'
import { createEntranceColumns } from './components/TableColumns'

const Entrance = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()

  // State management
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Dialog states
  const [addEntranceDialogOpen, setAddEntranceDialogOpen] = useState(false)
  const [editEntranceDialogOpen, setEditEntranceDialogOpen] = useState(false)
  const [deleteEntranceDialogOpen, setDeleteEntranceDialogOpen] = useState(false)

  // Selected items for editing/deleting
  const [selectedEntrance, setSelectedEntrance] = useState(null)

  // Form data
  const [entranceFormData, setEntranceFormData] = useState({
    personName: '',
    contactNumber: '',
    email: '',
    address: '',
    entranceFee: '',
    notes: ''
  })

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useGetById('/events', eventId)

  // Fetch entrances for this event
  const { data: entrancesData = [], refetch: refetchEntrances } = useGetAll(`/entrances?eventID=${eventId}`)

  // Mutations
  const createEntranceMutation = useCreateMutation('/entrances', {
    successMessage: 'Entrance fee recorded successfully',
    errorMessage: (error) => {
      // Extract the actual error message from the backend response
      return error?.response?.data?.message || 'Failed to record entrance fee'
    },
    onSuccess: () => {
      setAddEntranceDialogOpen(false)
      resetEntranceForm()
      refetchEntrances()
    }
  })

  const updateEntranceMutation = usePutMutation('/entrances', {
    successMessage: 'Entrance record updated successfully',
    errorMessage: (error) => {
      // Extract the actual error message from the backend response
      return error?.response?.data?.message || 'Failed to update entrance record'
    },
    onSuccess: () => {
      setEditEntranceDialogOpen(false)
      setSelectedEntrance(null)
      resetEntranceForm()
      refetchEntrances()
    }
  })

  const deleteEntranceMutation = useCustomMutation(
    async ({ id }) => {
      const response = await api.delete(`/entrances/${id}`)
      return response.data
    },
    {
      successMessage: 'Entrance record deleted successfully',
      errorMessage: (error) => {
        // Extract the actual error message from the backend response
        return error?.response?.data?.message || 'Failed to delete entrance record'
      },
      onSuccess: () => {
        setDeleteEntranceDialogOpen(false)
        setSelectedEntrance(null)
        refetchEntrances()
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
      setEntranceFormData(prev => {
        const newEntranceFee = selectedEvent.entryFee?.toString() || ''

        // Only update if values have actually changed
        if (prev.entranceFee !== newEntranceFee) {
          return {
            ...prev,
            entranceFee: newEntranceFee
          }
        }
        return prev
      })
    }
  }, [selectedEvent?._id, selectedEvent?.entryFee])

  // Use the API data directly instead of local state
  const entrances = entrancesData || []

  // Form handlers
  const handleEntranceInputChange = (field, value) => {
    setEntranceFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetEntranceForm = () => {
    setEntranceFormData({
      personName: '',
      contactNumber: '',
      email: '',
      address: '',
      entranceFee: selectedEvent?.entryFee?.toString() || '',
      notes: ''
    })
  }

  // Submit handlers
  const handleAddEntrance = async () => {
    const requiredFields = ['personName', 'contactNumber', 'email', 'address', 'entranceFee']
    const missingFields = requiredFields.filter(field => !entranceFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    const entranceData = {
      ...entranceFormData,
      eventID: eventId,
      entranceFee: parseFloat(entranceFormData.entranceFee)
    }

    createEntranceMutation.mutate(entranceData)
  }

  const handleEditEntrance = async () => {
    if (!selectedEntrance) return

    const requiredFields = ['personName', 'contactNumber', 'email', 'address', 'entranceFee']
    const missingFields = requiredFields.filter(field => !entranceFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    const entranceData = {
      ...entranceFormData,
      entranceFee: parseFloat(entranceFormData.entranceFee)
    }

    updateEntranceMutation.mutate({
      id: selectedEntrance._id,
      data: entranceData
    })
  }

  const handleDeleteEntrance = () => {
    if (!selectedEntrance) return
    deleteEntranceMutation.mutate({ id: selectedEntrance._id })
  }

  // Action handlers
  const handleEditEntranceClick = (entrance) => {
    setSelectedEntrance(entrance)
    setEntranceFormData({
      personName: entrance.personName,
      contactNumber: entrance.contactNumber,
      email: entrance.email,
      address: entrance.address,
      entranceFee: entrance.entranceFee.toString(),
      notes: entrance.notes || ''
    })
    setEditEntranceDialogOpen(true)
  }

  const handleDeleteEntranceClick = (entrance) => {
    setSelectedEntrance(entrance)
    setDeleteEntranceDialogOpen(true)
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
  const entranceColumns = createEntranceColumns(
    formatCurrency,
    formatDate,
    handleEditEntranceClick,
    handleDeleteEntranceClick,
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
      title={`Entrance Registration - ${selectedEvent.eventName}`}
      description="Record entrance fees and manage entrance records for this event"
      headerButton={
        <Button variant="outline" onClick={() => navigate('/entrance-staff/entrance-registration')}>
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

      {/* Entrance Records Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Entrance Records ({entrances.length})</h3>
          <Button onClick={() => setAddEntranceDialogOpen(true)} disabled={isEventCompleted}>
            <Plus className="h-4 w-4 mr-2" />
            Record Entrance
          </Button>
        </div>
        <DataTable
          data={entrances}
          columns={entranceColumns}
          pageSize={10}
          searchable={true}
          filterable={true}
          title="Entrance Records"
          loading={false}
          emptyMessage="No entrance records yet"
          className="shadow-sm"
        />
      </div>

      {/* Add Entrance Dialog */}
      <EntranceForm
        open={addEntranceDialogOpen}
        onOpenChange={setAddEntranceDialogOpen}
        title="Record Entrance Fee"
        description="Record a new entrance fee payment"
        formData={entranceFormData}
        onInputChange={handleEntranceInputChange}
        onSubmit={handleAddEntrance}
        onCancel={() => setAddEntranceDialogOpen(false)}
        isPending={createEntranceMutation.isPending}
        isEdit={false}
      />

      {/* Edit Entrance Dialog */}
      <EntranceForm
        open={editEntranceDialogOpen}
        onOpenChange={setEditEntranceDialogOpen}
        title="Edit Entrance Record"
        description="Update entrance record information"
        formData={entranceFormData}
        onInputChange={handleEntranceInputChange}
        onSubmit={handleEditEntrance}
        onCancel={() => setEditEntranceDialogOpen(false)}
        isPending={updateEntranceMutation.isPending}
        isEdit={true}
      />

      {/* Delete Entrance Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteEntranceDialogOpen}
        onOpenChange={setDeleteEntranceDialogOpen}
        title="Delete Entrance Record"
        description={`Are you sure you want to delete the entrance record for "${selectedEntrance?.personName}"? This action cannot be undone.`}
        confirmText="Delete Record"
        cancelText="Cancel"
        onConfirm={handleDeleteEntrance}
        onCancel={() => setDeleteEntranceDialogOpen(false)}
        variant="destructive"
        loading={deleteEntranceMutation.isPending}
      />
    </PageLayout>
  )
}

export default Entrance
