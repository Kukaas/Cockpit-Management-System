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
import RentalForm from './components/RentalForm'
import DetailsDialog from './components/DetailsDialog'
import EventDetailsCard from '@/components/EventDetailsCard'
import ReturnCagesDialog from './components/ReturnCagesDialog'
import { createRentalColumns } from './components/TableColumns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { printRentalReceipt } from './utils/printReceipt'

const Rentals = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()

  // State management
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Dialog states
  const [addRentalDialogOpen, setAddRentalDialogOpen] = useState(false)
  const [editRentalDialogOpen, setEditRentalDialogOpen] = useState(false)
  const [deleteRentalDialogOpen, setDeleteRentalDialogOpen] = useState(false)
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false)
  const [rentalStatusDialogOpen, setRentalStatusDialogOpen] = useState(false)
  const [returnCagesDialogOpen, setReturnCagesDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Selected items for editing/deleting
  const [selectedRental, setSelectedRental] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [pendingStatusChange, setPendingStatusChange] = useState(null) // { rentalId, newStatus, oldStatus, rental }
  const [pendingRentalStatusChange, setPendingRentalStatusChange] = useState(null) // { rentalId, newStatus, oldStatus, rental }

  // Form data
  const [rentalFormData, setRentalFormData] = useState({
    quantity: '0',
    date: new Date().toISOString().split('T')[0], // Default to today
    nameOfRenter: '',
    contactNumber: '',
    eventID: '',
    paymentStatus: 'unpaid',
    selectedCageIds: []
  })

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useGetById('/events', eventId)

  // Fetch rentals for this specific event
  const { data: rentalsData = [], refetch: refetchRentals } = useGetAll(`/cage-rentals/event/${eventId}`)

  // Mutations
  const createRentalMutation = useCreateMutation('/cage-rentals', {
    successMessage: 'Cage rental created successfully',
    errorMessage: (error) => {
      return error?.response?.data?.message || 'Failed to create cage rental'
    },
    onSuccess: () => {
      setAddRentalDialogOpen(false)
      resetRentalForm()
      refetchRentals()
    }
  })

  const updateRentalMutation = usePutMutation('/cage-rentals', {
    successMessage: 'Cage rental updated successfully',
    errorMessage: (error) => {
      return error?.response?.data?.message || 'Failed to update cage rental'
    },
    onSuccess: () => {
      setEditRentalDialogOpen(false)
      setSelectedRental(null)
      resetRentalForm()
      refetchRentals()
    }
  })

  const deleteRentalMutation = useCustomMutation(
    async ({ id }) => {
      const response = await api.delete(`/cage-rentals/${id}`)
      return response.data
    },
    {
      successMessage: 'Cage rental deleted successfully',
      errorMessage: (error) => {
        return error?.response?.data?.message || 'Failed to delete cage rental'
      },
      onSuccess: () => {
        setDeleteRentalDialogOpen(false)
        setSelectedRental(null)
        refetchRentals()
      }
    }
  )

  // Status change mutation
  const statusChangeMutation = useCustomMutation(
    async ({ id, paymentStatus }) => {
      const response = await api.patch(`/cage-rentals/${id}/payment-status`, { paymentStatus })
      return response.data
    },
    {
      successMessage: 'Payment status updated successfully',
      errorMessage: (error) => {
        return error?.response?.data?.message || 'Failed to update payment status'
      },
      onSuccess: () => {
        setStatusChangeDialogOpen(false)
        setPendingStatusChange(null)
        refetchRentals()
      },
    }
  )

  // Rental status change mutation
  const rentalStatusMutation = useCustomMutation(
    async ({ id, rentalStatus }) => {
      const response = await api.patch(`/cage-rentals/${id}/rental-status`, { rentalStatus })
      return response.data
    },
    {
      successMessage: 'Rental status updated successfully',
      errorMessage: (error) => {
        return error?.response?.data?.message || 'Failed to update rental status'
      },
      onSuccess: () => {
        setRentalStatusDialogOpen(false)
        setPendingRentalStatusChange(null)
        refetchRentals()
      },
    }
  )

  // Return selected cages mutation
  const returnCagesMutation = useCustomMutation(
    async ({ id, cageIds }) => {
      const response = await api.patch(`/cage-rentals/${id}/return-cages`, { cageIds })
      return response.data
    },
    {
      successMessage: (data) => {
        return data?.message || 'Cages returned successfully'
      },
      errorMessage: (error) => {
        return error?.response?.data?.message || 'Failed to return cages'
      },
      onSuccess: () => {
        setReturnCagesDialogOpen(false)
        setSelectedRental(null)
        refetchRentals()
      },
    }
  )

  // Update state when data changes
  useEffect(() => {
    if (event && event._id && (!selectedEvent || selectedEvent._id !== event._id)) {
      setSelectedEvent(event)
      // Set eventID in form
      setRentalFormData(prev => ({
        ...prev,
        eventID: event._id
      }))
    }
  }, [event, selectedEvent])

  // Use the API data directly instead of local state
  const rentals = rentalsData || []

  // Calculate total revenue (only paid rentals)
  const totalRevenue = rentals
    .filter(rental => rental.paymentStatus === 'paid')
    .reduce((sum, rental) => sum + (rental.totalPrice || 0), 0)

  // Form handlers
  const handleRentalInputChange = (field, value) => {
    setRentalFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetRentalForm = () => {
    setRentalFormData({
      quantity: '0',
      date: new Date().toISOString().split('T')[0], // Default to today
      nameOfRenter: '',
      contactNumber: '',
      eventID: selectedEvent?._id || '',
      paymentStatus: 'unpaid',
      selectedCageIds: []
    })
  }

  // Submit handlers
  const handleAddRental = async () => {
    const requiredFields = ['quantity', 'date', 'nameOfRenter', 'eventID', 'selectedCageIds']
    const missingFields = requiredFields.filter(field => !rentalFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    if (rentalFormData.selectedCageIds.length === 0) {
      toast.error('Please select at least one cage')
      return
    }

    const rentalData = {
      ...rentalFormData,
      quantity: parseInt(rentalFormData.quantity)
    }

    createRentalMutation.mutate(rentalData)
  }

  const handleEditRental = async () => {
    if (!selectedRental) return

    const requiredFields = ['quantity', 'date', 'nameOfRenter', 'eventID']
    const missingFields = requiredFields.filter(field => !rentalFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    // Calculate total price based on event's cageRentalFee
    const rentalFeePerCage = selectedEvent?.cageRentalFee || 20 // Default to 20 if not set
    const totalPrice = parseInt(rentalFormData.quantity) * rentalFeePerCage

    const rentalData = {
      ...rentalFormData,
      quantity: parseInt(rentalFormData.quantity),
      totalPrice: totalPrice
    }

    updateRentalMutation.mutate({
      id: selectedRental._id,
      data: rentalData
    })
  }

  const handleDeleteRental = () => {
    if (!selectedRental) return
    deleteRentalMutation.mutate({ id: selectedRental._id })
  }

  // Action handlers
  const handleEditRentalClick = (rental) => {
    setSelectedRental(rental)
    setRentalFormData({
      quantity: rental.quantity.toString(),
      date: rental.date.split('T')[0], // Format date for input
      nameOfRenter: rental.nameOfRenter,
      contactNumber: rental.contactNumber || '',
      eventID: rental.eventID?._id || selectedEvent?._id || '',
      paymentStatus: rental.paymentStatus || 'unpaid',
      selectedCageIds: rental.cages?.map(cage => cage.cageNo?._id || cage.cageNo) || []
    })
    setEditRentalDialogOpen(true)
  }

  const handleDeleteRentalClick = (rental) => {
    setSelectedRental(rental)
    setDeleteRentalDialogOpen(true)
  }

  const handleStatusChange = (rentalId, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return

    // Find the rental to get more context for the confirmation
    const rental = rentals.find(r => r._id === rentalId)

    setPendingStatusChange({
      rentalId,
      newStatus,
      currentStatus,
      rental
    })
    setStatusChangeDialogOpen(true)
  }

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      statusChangeMutation.mutate({
        id: pendingStatusChange.rentalId,
        paymentStatus: pendingStatusChange.newStatus
      })
    }
  }

  const cancelStatusChange = () => {
    setStatusChangeDialogOpen(false)
    setPendingStatusChange(null)
  }

  const handleRentalStatusChange = (rentalId, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return

    // Find the rental to get more context for the confirmation
    const rental = rentals.find(r => r._id === rentalId)

    setPendingRentalStatusChange({
      rentalId,
      newStatus,
      currentStatus,
      rental
    })
    setRentalStatusDialogOpen(true)
  }

  const confirmRentalStatusChange = () => {
    if (pendingRentalStatusChange) {
      rentalStatusMutation.mutate({
        id: pendingRentalStatusChange.rentalId,
        rentalStatus: pendingRentalStatusChange.newStatus
      })
    }
  }

  const cancelRentalStatusChange = () => {
    setRentalStatusDialogOpen(false)
    setPendingRentalStatusChange(null)
  }

  // Handle return cages - open dialog for selection
  const handleOpenReturnDialog = (rental) => {
    setSelectedRental(rental)
    // If only one cage or all cages already returned, use old flow
    const activeCages = rental.cages.filter(cage => !cage.returnedAt)
    if (activeCages.length === 0) {
      toast.error('All cages have already been returned')
      return
    }
    if (activeCages.length === 1) {
      // Single cage - return immediately with confirmation
      setPendingRentalStatusChange({
        rentalId: rental._id,
        newStatus: 'returned',
        currentStatus: rental.rentalStatus,
        rental
      })
      setRentalStatusDialogOpen(true)
    } else {
      // Multiple cages - show selection dialog
      setReturnCagesDialogOpen(true)
    }
  }

  // Confirm return of selected cages
  const handleConfirmReturnCages = (cageIds) => {
    if (!selectedRental || !cageIds || cageIds.length === 0) return
    returnCagesMutation.mutate({
      id: selectedRental._id,
      cageIds
    })
  }

  // Handle view details
  const handleViewDetails = (rental) => {
    setSelectedItem(rental)
    setDetailDialogOpen(true)
  }

  // Handle print receipt
  const handlePrint = (rental) => {
    printRentalReceipt(rental, selectedEvent)
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

  // Create table columns
  const rentalColumns = createRentalColumns(
    formatCurrency,
    formatDate,
    handleEditRentalClick,
    handleDeleteRentalClick,
    handleStatusChange,
    statusChangeMutation,
    handleOpenReturnDialog,
    rentalStatusMutation,
    handleViewDetails,
    handlePrint
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
      title={`Cage Rentals - ${selectedEvent.eventName}`}
      description="Manage cage rentals for this event"
      headerButton={
        <Button variant="outline" onClick={() => navigate('/tangkal-staff/cage-rentals')}>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rental Revenue</CardTitle> </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total cage rental fees collected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cage Rentals Section */}
      <div className="space-y-4">
        <div className="flex justify-end items-center">
          <Button
            onClick={() => {
              resetRentalForm() // Clear all form data before opening
              setAddRentalDialogOpen(true)
            }}
            disabled={selectedEvent?.status === 'completed'}
            title={selectedEvent?.status === 'completed' ? 'Cannot add rentals to completed events' : 'Add new cage rental'}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Rental
          </Button>
        </div>
        <DataTable
          data={rentals}
          columns={rentalColumns}
          pageSize={10}
          searchable={true}
          filterable={true}
          title="Cage Rentals"
          loading={false}
          emptyMessage="No cage rentals yet for this event"
          className="shadow-sm"
        />
      </div>

      {/* Add Rental Dialog */}
      <RentalForm
        open={addRentalDialogOpen}
        onOpenChange={setAddRentalDialogOpen}
        title="Add Cage Rental"
        description="Create a new cage rental record for this event"
        formData={rentalFormData}
        onInputChange={handleRentalInputChange}
        onSubmit={handleAddRental}
        onCancel={() => setAddRentalDialogOpen(false)}
        isPending={createRentalMutation.isPending}
        isEdit={false}
        eventId={eventId}
      />

      {/* Edit Rental Dialog */}
      <RentalForm
        open={editRentalDialogOpen}
        onOpenChange={setEditRentalDialogOpen}
        title="Edit Cage Rental"
        description="Update cage rental information"
        formData={rentalFormData}
        onInputChange={handleRentalInputChange}
        onSubmit={handleEditRental}
        onCancel={() => setEditRentalDialogOpen(false)}
        isPending={updateRentalMutation.isPending}
        isEdit={true}
        eventId={eventId}
        rentalData={selectedRental}
      />

      {/* Delete Rental Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteRentalDialogOpen}
        onOpenChange={setDeleteRentalDialogOpen}
        title="Delete Cage Rental"
        description={
          selectedRental?.rentalStatus === 'returned'
            ? `Cannot delete returned rental for "${selectedRental?.nameOfRenter}" (${selectedRental?.quantity} cage${selectedRental?.quantity > 1 ? 's' : ''}). Returned rentals cannot be deleted.`
            : `Are you sure you want to delete the cage rental for "${selectedRental?.nameOfRenter}" (${selectedRental?.quantity} cage${selectedRental?.quantity > 1 ? 's' : ''})? This will make the cages available again. This action cannot be undone.`
        }
        confirmText={selectedRental?.rentalStatus === 'returned' ? 'OK' : 'Delete Rental'}
        cancelText="Cancel"
        onConfirm={selectedRental?.rentalStatus === 'returned' ? () => setDeleteRentalDialogOpen(false) : handleDeleteRental}
        onCancel={() => setDeleteRentalDialogOpen(false)}
        variant={selectedRental?.rentalStatus === 'returned' ? 'default' : 'destructive'}
        loading={deleteRentalMutation.isPending}
      />

      {/* Status Change Confirmation Dialog */}
      <ConfirmationDialog
        open={statusChangeDialogOpen}
        onOpenChange={setStatusChangeDialogOpen}
        title="Change Payment Status"
        description={
          pendingStatusChange
            ? `Are you sure you want to change the payment status for "${pendingStatusChange.rental?.nameOfRenter}" from "${pendingStatusChange.currentStatus}" to "${pendingStatusChange.newStatus}"?`
            : "Are you sure you want to change the payment status?"
        }
        confirmText="Change Status"
        cancelText="Cancel"
        onConfirm={confirmStatusChange}
        onCancel={cancelStatusChange}
        variant="default"
        loading={statusChangeMutation.isPending}
      />

      {/* Rental Status Change Confirmation Dialog */}
      <ConfirmationDialog
        open={rentalStatusDialogOpen}
        onOpenChange={setRentalStatusDialogOpen}
        title="Change Rental Status"
        description={
          pendingRentalStatusChange
            ? `Are you sure you want to mark the cage rental for "${pendingRentalStatusChange.rental?.nameOfRenter}" as returned? This will make all ${pendingRentalStatusChange.rental?.quantity} cage${pendingRentalStatusChange.rental?.quantity > 1 ? 's' : ''} available again.`
            : "Are you sure you want to change the rental status?"
        }
        confirmText="Mark as Returned"
        cancelText="Cancel"
        onConfirm={confirmRentalStatusChange}
        onCancel={cancelRentalStatusChange}
        variant="default"
        loading={rentalStatusMutation.isPending}
      />

      {/* Return Cages Dialog */}
      <ReturnCagesDialog
        open={returnCagesDialogOpen}
        onOpenChange={setReturnCagesDialogOpen}
        rental={selectedRental}
        onConfirm={handleConfirmReturnCages}
        isPending={returnCagesMutation.isPending}
      />

      {/* Detail View Dialog */}
      <DetailsDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        selectedItem={selectedItem}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />
    </PageLayout>
  )
}

export default Rentals
