import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Printer } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { toast } from 'sonner'
import { useGetAll, useGetById } from '@/hooks/useApiQueries'
import { useCreateMutation, usePutMutation, useCustomMutation } from '@/hooks/useApiMutations'
import api from '@/services/api'
import ConfirmationDialog from '@/components/custom/ConfirmationDialog'
import DataTable from '@/components/custom/DataTable'
import { printEntranceReport } from '@/lib/printEntranceReport'

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
    count: 1
  })

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useGetById('/events', eventId)

  // Fetch entrances for this event
  const { data: entrancesData = [], refetch: refetchEntrances } = useGetAll(`/entrances?eventID=${eventId}`)

  // Mutations
  const createEntranceMutation = useCreateMutation('/entrances', {
    successMessage: 'Entrance tally recorded successfully',
    errorMessage: (error) => {
      return error?.response?.data?.message || 'Failed to record entrance tally'
    },
    onSuccess: () => {
      // Reset form but keep dialog open for quick consecutive entries
      resetEntranceForm()
      refetchEntrances()
      // Keep the dialog open - don't close it
    }
  })

  const updateEntranceMutation = usePutMutation('/entrances', {
    successMessage: 'Entrance record updated successfully',
    errorMessage: (error) => {
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

  // Redirect if event is not active
  useEffect(() => {
    if (event && event.status !== 'active') {
      toast.error('This event is not active')
      navigate('/entrance-staff/entrance-registration')
    }
  }, [event, navigate])

  // Use the API data directly instead of local state
  const entrances = entrancesData || []

  // Form handlers
  const handleEntranceInputChange = (field, value) => {
    setEntranceFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetEntranceForm = () => {
    setEntranceFormData({
      count: 1
    })
  }

  // Submit handlers
  const handleAddEntrance = async () => {
    if (!entranceFormData.count || entranceFormData.count < 1) {
      toast.error('Please enter a valid count (minimum 1)')
      return
    }

    const entranceData = {
      eventID: eventId,
      count: Number(entranceFormData.count)
    }

    createEntranceMutation.mutate(entranceData)
  }

  const handleEditEntrance = async () => {
    if (!selectedEntrance) return

    if (!entranceFormData.count || entranceFormData.count < 1) {
      toast.error('Please enter a valid count (minimum 1)')
      return
    }

    const entranceData = {
      count: Number(entranceFormData.count)
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
      count: entrance.count
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

  // Check if event date has passed
  const eventDate = selectedEvent?.date ? new Date(selectedEvent.date) : null
  const isEventDatePassed = eventDate ? eventDate < new Date() : false

  // Combined check for disabling actions
  const isEventDisabled = isEventCompleted || isEventDatePassed

  // Calculate total entrances and revenue
  const totalEntrances = entrances.reduce((sum, entrance) => sum + entrance.count, 0)
  const totalRevenue = totalEntrances * (selectedEvent?.entranceFee || 0) // Use dynamic entrance fee

  // Check if event is at capacity
  const isAtCapacity = totalEntrances >= (selectedEvent?.maxCapacity || 0)

  // Create table columns
  const entranceColumns = createEntranceColumns(
    formatDate,
    formatCurrency,
    handleEditEntranceClick,
    handleDeleteEntranceClick,
    isEventDisabled
  )

  // Print functionality
  const handlePrint = () => {
    printEntranceReport({
      event: selectedEvent,
      entrances,
      formatDate,
      formatCurrency,
      totalEntrances,
      totalRevenue
    })
  }

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
      title={`Entrance Tally - ${selectedEvent.eventName}`}
      description="Record entrance tallies and manage entrance records for this event"
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Total Tally Records</h3>
          <p className="text-2xl font-bold text-gray-900">{entrances.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Total Entrances</h3>
          <p className="text-2xl font-bold text-blue-600">{totalEntrances}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Capacity Status</h3>
          <p className={`text-2xl font-bold ${isAtCapacity ? 'text-red-600' : totalEntrances / (selectedEvent?.maxCapacity || 1) >= 0.8 ? 'text-orange-600' : 'text-green-600'}`}>
            {totalEntrances} / {selectedEvent?.maxCapacity || 0}
          </p>
          <p className="text-xs text-gray-500">
            {selectedEvent?.maxCapacity ? Math.round((totalEntrances / selectedEvent.maxCapacity) * 100) : 0}% full
          </p>
        </div>
      </div>

      {/* Entrance Records Section */}
      <div className="space-y-4">
        <div className="flex justify-end items-center">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print Report
            </Button>
            <Button onClick={() => setAddEntranceDialogOpen(true)} disabled={isEventDisabled || isAtCapacity}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tally
            </Button>
          </div>
        </div>
        <DataTable
          data={entrances}
          columns={entranceColumns}
          pageSize={10}
          searchable={true}
          filterable={true}
          title="Entrance Tally Records"
          loading={false}
          emptyMessage="No entrance tally records yet"
          className="shadow-sm"
        />
      </div>

      {/* Add Entrance Dialog */}
      <EntranceForm
        open={addEntranceDialogOpen}
        onOpenChange={setAddEntranceDialogOpen}
        title="Add Entrance Tally"
        description="Record a new entrance tally"
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
        title="Edit Entrance Tally"
        description="Update entrance tally record"
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
        title="Delete Entrance Tally"
        description={`Are you sure you want to delete this tally record of ${selectedEntrance?.count} entrances? This action cannot be undone.`}
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
