import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { toast } from 'sonner'
import { useGetAll } from '@/hooks/useApiQueries'
import { useCreateMutation, usePutMutation, useCustomMutation } from '@/hooks/useApiMutations'
import api from '@/services/api'
import ConfirmationDialog from '@/components/custom/ConfirmationDialog'
import DataTable from '@/components/custom/DataTable'

// Import custom components
import RentalForm from './components/RentalForm'
import { createRentalColumns } from './components/TableColumns'

const Rentals = () => {
  const navigate = useNavigate()

  // Dialog states
  const [addRentalDialogOpen, setAddRentalDialogOpen] = useState(false)
  const [editRentalDialogOpen, setEditRentalDialogOpen] = useState(false)
  const [deleteRentalDialogOpen, setDeleteRentalDialogOpen] = useState(false)
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false)
  const [rentalStatusDialogOpen, setRentalStatusDialogOpen] = useState(false)

  // Selected items for editing/deleting
  const [selectedRental, setSelectedRental] = useState(null)
  const [pendingStatusChange, setPendingStatusChange] = useState(null) // { rentalId, newStatus, oldStatus, rental }
  const [pendingRentalStatusChange, setPendingRentalStatusChange] = useState(null) // { rentalId, newStatus, oldStatus, rental }


  // Form data
  const [rentalFormData, setRentalFormData] = useState({
    cageNo: '',
    arena: '',
    price: '100',
    date: new Date().toISOString().split('T')[0], // Default to today
    nameOfRenter: '',
    contactNumber: '',
    email: '',
    eventID: '',
    notes: '',
    paymentStatus: 'unpaid'
  })

  // Fetch rentals and summary
  const { data: rentalsData = [], refetch: refetchRentals } = useGetAll('/cage-rentals')
  const { data: summaryData, refetch: refetchSummary } = useGetAll('/cage-rentals/summary')

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
      refetchSummary()
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
      refetchSummary()
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
        refetchSummary()
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
        refetchSummary()
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
        refetchSummary()
      },
    }
  )

  // Use the API data directly instead of local state
  const rentals = rentalsData || []

  // Form handlers
  const handleRentalInputChange = (field, value) => {
    setRentalFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetRentalForm = () => {
    setRentalFormData({
      cageNo: '',
      arena: '',
      price: '100',
      date: new Date().toISOString().split('T')[0], // Default to today
      nameOfRenter: '',
      contactNumber: '',
      email: '',
      eventID: '',
      notes: '',
      paymentStatus: 'unpaid'
    })
  }

  // Submit handlers
  const handleAddRental = async () => {
    const requiredFields = ['cageNo', 'arena', 'price', 'date', 'nameOfRenter']
    const missingFields = requiredFields.filter(field => !rentalFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    const rentalData = {
      ...rentalFormData,
      price: parseFloat(rentalFormData.price)
    }

    createRentalMutation.mutate(rentalData)
  }

  const handleEditRental = async () => {
    if (!selectedRental) return

    const requiredFields = ['cageNo', 'arena', 'price', 'date', 'nameOfRenter']
    const missingFields = requiredFields.filter(field => !rentalFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    const rentalData = {
      ...rentalFormData,
      price: parseFloat(rentalFormData.price)
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
      cageNo: rental.cageNo,
      arena: rental.arena,
      price: rental.price.toString(),
      date: rental.date.split('T')[0], // Format date for input
      nameOfRenter: rental.nameOfRenter,
      contactNumber: rental.contactNumber || '',
      email: rental.email || '',
      eventID: rental.eventID?._id || '',
      notes: rental.notes || '',
      paymentStatus: rental.paymentStatus
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
    handleRentalStatusChange,
    rentalStatusMutation
  )

  return (
    <PageLayout
      title="Cage Rentals Management"
      description="Manage cage rentals, track payments, and monitor availability"
      headerButton={
        <Button variant="outline" onClick={() => navigate('/tangkal-staff')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      }
    >

      {/* Cage Rentals Section */}
      <div className="space-y-4">
        <div className="flex justify-end items-center">
          <Button onClick={() => setAddRentalDialogOpen(true)}>
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
          emptyMessage="No cage rentals yet"
          className="shadow-sm"
        />
      </div>

      {/* Add Rental Dialog */}
      <RentalForm
        open={addRentalDialogOpen}
        onOpenChange={setAddRentalDialogOpen}
        title="Add Cage Rental"
        description="Create a new cage rental record"
        formData={rentalFormData}
        onInputChange={handleRentalInputChange}
        onSubmit={handleAddRental}
        onCancel={() => setAddRentalDialogOpen(false)}
        isPending={createRentalMutation.isPending}
        isEdit={false}
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
      />

             {/* Delete Rental Confirmation Dialog */}
       <ConfirmationDialog
         open={deleteRentalDialogOpen}
         onOpenChange={setDeleteRentalDialogOpen}
         title="Delete Cage Rental"
         description={
           selectedRental?.rentalStatus === 'returned'
             ? `Cannot delete returned rental for "${selectedRental?.nameOfRenter}" (${selectedRental?.cageNo?.cageNumber || selectedRental?.cageNo}). Returned rentals cannot be deleted.`
             : `Are you sure you want to delete the cage rental for "${selectedRental?.nameOfRenter}" (${selectedRental?.cageNo?.cageNumber || selectedRental?.cageNo})? This will make the cage available again. This action cannot be undone.`
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
            ? `Are you sure you want to mark the cage rental for "${pendingRentalStatusChange.rental?.nameOfRenter}" as returned? This will make the cage available again.`
            : "Are you sure you want to change the rental status?"
        }
        confirmText="Mark as Returned"
        cancelText="Cancel"
        onConfirm={confirmRentalStatusChange}
        onCancel={cancelRentalStatusChange}
        variant="default"
        loading={rentalStatusMutation.isPending}
      />
    </PageLayout>
  )
}

export default Rentals
