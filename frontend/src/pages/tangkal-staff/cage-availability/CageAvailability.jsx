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
import CageAvailabilityForm from './components/CageAvailabilityForm'
import CageAvailabilitySummary from './components/CageAvailabilitySummary'
import { createCageAvailabilityColumns } from './components/TableColumns'

const CageAvailability = () => {
  const navigate = useNavigate()

  // Dialog states
  const [addCageDialogOpen, setAddCageDialogOpen] = useState(false)
  const [editCageDialogOpen, setEditCageDialogOpen] = useState(false)
  const [deleteCageDialogOpen, setDeleteCageDialogOpen] = useState(false)

  // Selected items for editing/deleting
  const [selectedCage, setSelectedCage] = useState(null)

  // Form data
  const [cageFormData, setCageFormData] = useState({
    cageNumber: '',
    status: 'active',
    bulkCount: '1'
  })

  // Fetch cage availability records
  const { data: cagesData = [], refetch: refetchCages } = useGetAll('/cage-availability')

  // Fetch summary data
  const { data: summaryData } = useGetAll('/cage-availability/summary')

  // Mutations
  const createCageMutation = useCreateMutation('/cage-availability/bulk', {
    successMessage: 'Cages created successfully',
    errorMessage: (error) => {
      // Extract the actual error message from the backend response
      const errorMessage = error?.response?.data?.message;
      if (errorMessage) {
        return errorMessage;
      }
      return 'Failed to create cages. Please try again.';
    },
    onSuccess: () => {
      setAddCageDialogOpen(false)
      resetCageForm()
      refetchCages()
    }
  })

  const updateCageMutation = usePutMutation('/cage-availability', {
    successMessage: 'Cage availability updated successfully',
    errorMessage: (error) => {
      // Extract the actual error message from the backend response
      const errorMessage = error?.response?.data?.message;
      if (errorMessage) {
        return errorMessage;
      }
      return 'Failed to update cage availability. Please try again.';
    },
    onSuccess: () => {
      setEditCageDialogOpen(false)
      setSelectedCage(null)
      resetCageForm()
      refetchCages()
    }
  })

  const deleteCageMutation = useCustomMutation(
    async ({ id }) => {
      const response = await api.delete(`/cage-availability/${id}`)
      return response.data
    },
    {
      successMessage: 'Cage availability deleted successfully',
      errorMessage: (error) => {
        // Extract the actual error message from the backend response
        const errorMessage = error?.response?.data?.message;
        if (errorMessage) {
          return errorMessage;
        }
        return 'Failed to delete cage availability. Please try again.';
      },
      onSuccess: () => {
        setDeleteCageDialogOpen(false)
        setSelectedCage(null)
        refetchCages()
      }
    }
  )

  // Use the API data directly instead of local state
  const cages = cagesData || []

  // Form handlers
  const handleCageInputChange = (field, value) => {
    setCageFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetCageForm = () => {
    setCageFormData({
      cageNumber: '',
      status: 'active',
      bulkCount: '1'
    })
  }

  // Submit handlers
  const handleAddCage = async () => {
    const requiredFields = ['bulkCount']
    const missingFields = requiredFields.filter(field => !cageFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    const bulkCount = parseInt(cageFormData.bulkCount)
    if (bulkCount < 1 || bulkCount > 100) {
      toast.error('Please enter a valid number of cages (1-100)')
      return
    }

    const cageData = {
      status: cageFormData.status,
      count: bulkCount
    }

    createCageMutation.mutate(cageData)
  }

  const handleEditCage = async () => {
    if (!selectedCage) return

    const requiredFields = ['cageNumber']
    const missingFields = requiredFields.filter(field => !cageFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    // Check for duplicate cage number (excluding current cage)
    const existingCage = cages.find(cage =>
      cage.cageNumber === cageFormData.cageNumber &&
      cage._id !== selectedCage._id
    )

    if (existingCage) {
      toast.error(`Cage number "${cageFormData.cageNumber}" already exists. Please use a different cage number.`)
      return
    }

    const cageData = {
      cageNumber: cageFormData.cageNumber,
      status: cageFormData.status
    }

    updateCageMutation.mutate({
      id: selectedCage._id,
      data: cageData
    })
  }

  const handleDeleteCage = () => {
    if (!selectedCage) return
    deleteCageMutation.mutate({ id: selectedCage._id })
  }

  // Action handlers
  const handleEditCageClick = (cage) => {
    setSelectedCage(cage)
    setCageFormData({
      cageNumber: cage.cageNumber,
      status: cage.status,
      bulkCount: '1'
    })
    setEditCageDialogOpen(true)
  }

  const handleDeleteCageClick = (cage) => {
    setSelectedCage(cage)
    setDeleteCageDialogOpen(true)
  }

  // Create table columns
  const cageColumns = createCageAvailabilityColumns(
    handleEditCageClick,
    handleDeleteCageClick
  )

  return (
    <PageLayout
      title="Cage Availability Management"
      description="Manage cage availability records and track cage"
      headerButton={
        <Button variant="outline" onClick={() => navigate('/tangkal-staff')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      }
    >
      {/* Cage Availability Summary */}
      <CageAvailabilitySummary summaryData={summaryData} />

      {/* Cage Availability Section */}
      <div className="space-y-4">
        <div className="flex justify-end items-center">
          <Button onClick={() => setAddCageDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Cages
          </Button>
        </div>
        <DataTable
          data={cages}
          columns={cageColumns}
          pageSize={10}
          searchable={false}
          filterable={true}
          title="Cage Availability"
          loading={false}
          emptyMessage="No cage availability records yet"
          className="shadow-sm"
        />
      </div>

      {/* Add Cage Dialog */}
      <CageAvailabilityForm
        open={addCageDialogOpen}
        onOpenChange={setAddCageDialogOpen}
        title="Add Cage Availability"
        description="Create new cage availability records in bulk"
        formData={cageFormData}
        onInputChange={handleCageInputChange}
        onSubmit={handleAddCage}
        onCancel={() => setAddCageDialogOpen(false)}
        isPending={createCageMutation.isPending}
        isEdit={false}
      />

      {/* Edit Cage Dialog */}
      <CageAvailabilityForm
        open={editCageDialogOpen}
        onOpenChange={setEditCageDialogOpen}
        title="Edit Cage Availability"
        description="Update cage availability information"
        formData={cageFormData}
        onInputChange={handleCageInputChange}
        onSubmit={handleEditCage}
        onCancel={() => setEditCageDialogOpen(false)}
        isPending={updateCageMutation.isPending}
        isEdit={true}
      />

      {/* Delete Cage Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteCageDialogOpen}
        onOpenChange={setDeleteCageDialogOpen}
        title="Delete Cage Availability"
        description={`Are you sure you want to delete the cage availability record for "${selectedCage?.cageNumber}"? This action cannot be undone.`}
        confirmText="Delete Cage"
        cancelText="Cancel"
        onConfirm={handleDeleteCage}
        onCancel={() => setDeleteCageDialogOpen(false)}
        variant="destructive"
        loading={deleteCageMutation.isPending}
      />
    </PageLayout>
  )
}

export default CageAvailability
