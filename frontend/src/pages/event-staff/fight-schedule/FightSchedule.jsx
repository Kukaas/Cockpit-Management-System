import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Trophy, Users } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { toast } from 'sonner'
import { useGetAll, useGetById } from '@/hooks/useApiQueries'
import { useCreateMutation, usePutMutation, useCustomMutation } from '@/hooks/useApiMutations'
import api from '@/services/api'
import ConfirmationDialog from '@/components/custom/ConfirmationDialog'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'

// Import custom components
import EventDetailsCard from './components/EventDetailsCard'
import FightForm from './components/FightForm'
import MatchResultForm from './components/MatchResultForm'
import FightTabs from './components/FightTabs'
import { createFightColumns, createMatchResultColumns } from './components/TableColumns'

const FightSchedule = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()

  // State management
  const [activeTab, setActiveTab] = useState('fights')
  const [selectedItem, setSelectedItem] = useState(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Dialog states
  const [addFightDialogOpen, setAddFightDialogOpen] = useState(false)
  const [editFightDialogOpen, setEditFightDialogOpen] = useState(false)
  const [addResultDialogOpen, setAddResultDialogOpen] = useState(false)
  const [editResultDialogOpen, setEditResultDialogOpen] = useState(false)
  const [deleteFightDialogOpen, setDeleteFightDialogOpen] = useState(false)
  const [deleteResultDialogOpen, setDeleteResultDialogOpen] = useState(false)
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false)

  // Selected items
  const [selectedFight, setSelectedFight] = useState(null)
  const [selectedResult, setSelectedResult] = useState(null)
  const [pendingStatusChange, setPendingStatusChange] = useState(null) // { resultId, newStatus, oldStatus, resultData }

    // Form data
  const [fightFormData, setFightFormData] = useState({
    participant1: '',
    participant2: '',
    cockProfile1: '',
    cockProfile2: '',
    betAmount1: '',
    betAmount2: '',
    scheduledTime: '',
    notes: ''
  })

  const [resultFormData, setResultFormData] = useState({
    winnerParticipantID: '',
    loserParticipantID: '',
    winnerCockProfileID: '',
    loserCockProfileID: '',
    matchStartTime: '',
    matchEndTime: '',
    matchType: 'knockout',
    description: '',
    notes: ''
  })

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useGetById('/events', eventId)

  // Fetch fight schedules for this event
  const { data: fightsData = [], refetch: refetchFights } = useGetAll(`/fight-schedules/event/${eventId}`)

  // Fetch match results for this event
  const { data: resultsData = [], refetch: refetchResults } = useGetAll(`/match-results/event/${eventId}`)

  // Fetch available participants and their active cock profiles for this event
  const { data: availableData = {} } = useGetAll(`/fight-schedules/available-participants/${eventId}`)
  const participantsData = availableData.participants || []
  const cockProfilesData = availableData.cockProfiles || []

  // Use API data directly instead of local state
  const availableParticipants = participantsData || []
  const availableCockProfiles = cockProfilesData || []

  // Mutations for fights
  const createFightMutation = useCreateMutation('/fight-schedules', {
    successMessage: 'Fight scheduled successfully',
    errorMessage: (error) => {
      // Extract the actual error message from the backend response
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
      // Extract the actual error message from the backend response
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
        // Extract the actual error message from the backend response
        return error?.response?.data?.message || 'Failed to delete fight'
      },
      onSuccess: () => {
        setDeleteFightDialogOpen(false)
        setSelectedFight(null)
        refetchFights()
      }
    }
  )

  // Mutations for match results
  const createResultMutation = useCreateMutation('/match-results', {
    successMessage: 'Match result recorded successfully',
    errorMessage: (error) => {
      // Extract the actual error message from the backend response
      return error?.response?.data?.message || 'Failed to record match result'
    },
    onSuccess: () => {
      setAddResultDialogOpen(false)
      resetResultForm()
      refetchResults()
      refetchFights() // Refresh fights as status may change
    }
  })

  const updateResultMutation = usePutMutation('/match-results', {
    successMessage: 'Match result updated successfully',
    errorMessage: (error) => {
      // Extract the actual error message from the backend response
      return error?.response?.data?.message || 'Failed to update match result'
    },
    onSuccess: () => {
      setEditResultDialogOpen(false)
      setSelectedResult(null)
      resetResultForm()
      refetchResults()
    }
  })

  const deleteResultMutation = useCustomMutation(
    async ({ id }) => {
      const response = await api.delete(`/match-results/${id}`)
      return response.data
    },
    {
      successMessage: 'Match result deleted successfully',
      errorMessage: (error) => {
        // Extract the actual error message from the backend response
        return error?.response?.data?.message || 'Failed to delete match result'
      },
      onSuccess: () => {
        setDeleteResultDialogOpen(false)
        setSelectedResult(null)
        refetchResults()
        refetchFights() // Refresh fights as status may change
      }
    }
  )

  const updateResultStatusMutation = useCustomMutation(
    async ({ id, status }) => {
      const response = await api.patch(`/match-results/${id}/status`, { status })
      return response.data
    },
    {
      successMessage: 'Match result status updated successfully',
      errorMessage: (error) => {
        // Extract the actual error message from the backend response
        return error?.response?.data?.message || 'Failed to update match result status'
      },
      onSuccess: () => {
        setStatusChangeDialogOpen(false)
        setPendingStatusChange(null)
        refetchResults()
      }
    }
  )

  // No need for selectedEvent state - using event data directly

  // Form handlers
  const handleFightInputChange = (field, value) => {
    setFightFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleResultInputChange = (field, value) => {
    setResultFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetFightForm = () => {
    setFightFormData({
      participant1: '',
      participant2: '',
      cockProfile1: '',
      cockProfile2: '',
      betAmount1: '',
      betAmount2: '',
      scheduledTime: '',
      notes: ''
    })
  }

  const resetResultForm = () => {
    setResultFormData({
      winnerParticipantID: '',
      loserParticipantID: '',
      winnerCockProfileID: '',
      loserCockProfileID: '',
      matchStartTime: '',
      matchEndTime: '',
      matchType: 'knockout',
      description: '',
      notes: ''
    })
  }

  // Submit handlers
  const handleAddFight = async () => {
    const requiredFields = ['participant1', 'participant2', 'cockProfile1', 'cockProfile2', 'betAmount1', 'betAmount2']
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

    // Extract entry numbers from selected cock profiles
    const cockProfile1 = availableCockProfiles.find(c => c._id === fightFormData.cockProfile1)
    const cockProfile2 = availableCockProfiles.find(c => c._id === fightFormData.cockProfile2)

    if (!cockProfile1 || !cockProfile2) {
      toast.error('Selected cock profiles not found')
      return
    }

    const fightData = {
      eventID: eventId,
      participantsID: [fightFormData.participant1, fightFormData.participant2],
      cockProfileID: [fightFormData.cockProfile1, fightFormData.cockProfile2],
      entryNo: [cockProfile1.entryNo, cockProfile2.entryNo], // Auto-extract from cock profiles
      positions: [
        { participantID: fightFormData.participant1, betAmount: parseFloat(fightFormData.betAmount1) },
        { participantID: fightFormData.participant2, betAmount: parseFloat(fightFormData.betAmount2) }
      ],
      scheduledTime: fightFormData.scheduledTime || new Date().toISOString(),
      notes: fightFormData.notes
      // totalBet and plazadaFee will be calculated automatically by the backend
    }

    createFightMutation.mutate(fightData)
  }

  const handleAddResult = async () => {
    const requiredFields = ['winnerParticipantID', 'loserParticipantID', 'winnerCockProfileID', 'loserCockProfileID', 'matchStartTime', 'matchEndTime', 'matchType']
    const missingFields = requiredFields.filter(field => !resultFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields`)
      return
    }

    const resultData = {
      matchID: selectedFight._id,
      ...resultFormData
    }

    createResultMutation.mutate(resultData)
  }

  // Action handlers
    const handleEditFightClick = (fight) => {
    setSelectedFight(fight)

    // Populate form with fight data (entry numbers are auto-extracted from cock profiles)
    setFightFormData({
      participant1: fight.participantsID[0]?._id || '',
      participant2: fight.participantsID[1]?._id || '',
      cockProfile1: fight.cockProfileID[0]?._id || '',
      cockProfile2: fight.cockProfileID[1]?._id || '',
      betAmount1: fight.position[0]?.betAmount?.toString() || '',
      betAmount2: fight.position[1]?.betAmount?.toString() || '',
      scheduledTime: formatDateTimeLocal(fight.scheduledTime),
      notes: fight.notes || ''
    })
    setEditFightDialogOpen(true)
  }

  const handleDeleteFightClick = (fight) => {
    setSelectedFight(fight)
    setDeleteFightDialogOpen(true)
  }

  const handleAddResultClick = (fight) => {
    setSelectedFight(fight)
    // Pre-populate with default values including scheduled time as match start time
    setResultFormData(prev => ({
      ...prev,
      matchStartTime: formatDateTimeLocal(fight.scheduledTime),
      // We'll let user select winner/loser from the fight participants
    }))
    setAddResultDialogOpen(true)
  }

  // Note: handleEditResultClick is not used in the current implementation
  // as match results are typically not edited after creation

  const handleDeleteResultClick = (result) => {
    setSelectedResult(result)
    setDeleteResultDialogOpen(true)
  }

  const handleStatusChange = (resultId, newStatus, currentStatus) => {
    // Find the result to get more context for the confirmation
    const result = resultsData.find(r => r._id === resultId)

    setPendingStatusChange({
      resultId,
      newStatus,
      currentStatus,
      result
    })
    setStatusChangeDialogOpen(true)
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

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      updateResultStatusMutation.mutate({
        id: pendingStatusChange.resultId,
        status: pendingStatusChange.newStatus
      })
      setStatusChangeDialogOpen(false)
      setPendingStatusChange(null)
    }
  }

  const cancelStatusChange = () => {
    setStatusChangeDialogOpen(false)
    setPendingStatusChange(null)
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

  // Helper function to convert date to local datetime-local format
  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    // Format to YYYY-MM-DDTHH:mm in local timezone (not UTC)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  // Create table columns
  const fightColumns = createFightColumns(
    formatCurrency,
    formatDate,
    handleEditFightClick,
    handleDeleteFightClick,
    handleAddResultClick,
    handleViewDetails
  )

  const resultColumns = createMatchResultColumns(
    formatCurrency,
    formatDate,
    handleDeleteResultClick,
    handleViewDetails,
    handleStatusChange
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

  if (!event) {
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
      title={`Fight Schedule - ${event.eventName}`}
      description="Manage fight schedules and record match results for this event"
      headerButton={
        <Button variant="outline" onClick={() => navigate('/event-staff/fight-schedule')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      }
    >
      {/* Event Details Card */}
      <EventDetailsCard
        event={event}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />

      {/* Fight and Results Tabs */}
      <FightTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fights={fightsData}
        results={resultsData}
        fightColumns={fightColumns}
        resultColumns={resultColumns}
        onAddFight={() => setAddFightDialogOpen(true)}
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
        availableParticipants={availableParticipants}
        availableCockProfiles={availableCockProfiles}
        isEdit={false}
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

          // Extract entry numbers from current cock profiles if they changed
          const cockProfile1 = availableCockProfiles.find(c => c._id === fightFormData.cockProfile1)
          const cockProfile2 = availableCockProfiles.find(c => c._id === fightFormData.cockProfile2)

          const fightData = {
            positions: [
              { participantID: fightFormData.participant1, betAmount: parseFloat(fightFormData.betAmount1) },
              { participantID: fightFormData.participant2, betAmount: parseFloat(fightFormData.betAmount2) }
            ],
            scheduledTime: fightFormData.scheduledTime,
            notes: fightFormData.notes
          }

          // Only include entry numbers if cock profiles are available (for reference)
          if (cockProfile1 && cockProfile2) {
            fightData.entryNo = [cockProfile1.entryNo, cockProfile2.entryNo]
          }

          updateFightMutation.mutate({ id: selectedFight._id, data: fightData })
        }}
        onCancel={() => setEditFightDialogOpen(false)}
        isPending={updateFightMutation.isPending}
        availableParticipants={availableParticipants}
        availableCockProfiles={availableCockProfiles}
        isEdit={true}
      />

      {/* Add Match Result Dialog */}
      <MatchResultForm
        open={addResultDialogOpen}
        onOpenChange={setAddResultDialogOpen}
        title="Record Match Result"
        description="Record the result of the match"
        formData={resultFormData}
        onInputChange={handleResultInputChange}
        onSubmit={handleAddResult}
        onCancel={() => setAddResultDialogOpen(false)}
        isPending={createResultMutation.isPending}
        selectedFight={selectedFight}
        isEdit={false}
      />

      {/* Edit Match Result Dialog */}
      <MatchResultForm
        open={editResultDialogOpen}
        onOpenChange={setEditResultDialogOpen}
        title="Edit Match Result"
        description="Update match result details"
        formData={resultFormData}
        onInputChange={handleResultInputChange}
        onSubmit={() => {
          if (!selectedResult) return
          updateResultMutation.mutate({ id: selectedResult._id, data: resultFormData })
        }}
        onCancel={() => setEditResultDialogOpen(false)}
        isPending={updateResultMutation.isPending}
        selectedFight={selectedResult?.matchID}
        isEdit={true}
      />

      {/* Delete Fight Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteFightDialogOpen}
        onOpenChange={setDeleteFightDialogOpen}
        title="Delete Fight"
        description={`Are you sure you want to delete Fight #${selectedFight?.fightNumber}? This action cannot be undone.`}
        confirmText="Delete Fight"
        cancelText="Cancel"
        onConfirm={() => deleteFightMutation.mutate({ id: selectedFight._id })}
        onCancel={() => setDeleteFightDialogOpen(false)}
        variant="destructive"
        loading={deleteFightMutation.isPending}
      />

      {/* Delete Result Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteResultDialogOpen}
        onOpenChange={setDeleteResultDialogOpen}
        title="Delete Match Result"
        description="Are you sure you want to delete this match result? This action cannot be undone."
        confirmText="Delete Result"
        cancelText="Cancel"
        onConfirm={() => deleteResultMutation.mutate({ id: selectedResult._id })}
        onCancel={() => setDeleteResultDialogOpen(false)}
        variant="destructive"
        loading={deleteResultMutation.isPending}
      />

      {/* Status Change Confirmation Dialog */}
      <ConfirmationDialog
        open={statusChangeDialogOpen}
        onOpenChange={setStatusChangeDialogOpen}
        title="Change Match Result Status"
        description={
          pendingStatusChange
            ? `Are you sure you want to change the status from "${pendingStatusChange.currentStatus?.replace('_', ' ')}" to "${pendingStatusChange.newStatus?.replace('_', ' ')}" for Fight #${pendingStatusChange.result?.matchID?.fightNumber}?`
            : "Are you sure you want to change the status?"
        }
        confirmText="Change Status"
        cancelText="Cancel"
        onConfirm={confirmStatusChange}
        onCancel={cancelStatusChange}
        variant="default"
        loading={updateResultStatusMutation.isPending}
      />

      {/* Detail View Dialog */}
      <CustomAlertDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        title={`${selectedItem?.type === 'fight' ? 'Fight Schedule' : 'Match Result'} Details`}
        description={`Detailed information for ${selectedItem?.type === 'fight' ? 'this fight schedule' : 'this match result'}`}
        maxHeight="max-h-[85vh]"
        actions={
          <Button onClick={handleCloseDetails} className="w-full sm:w-auto">
            Close
          </Button>
        }
      >
        {selectedItem && (
          <div className="space-y-6 overflow-y-auto pr-2">
            {selectedItem.type === 'fight' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Fight Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Fight Number</p>
                      <p className="font-medium text-gray-900">#{selectedItem.fightNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedItem.status === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedItem.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        selectedItem.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedItem.status.replace('_', ' ').charAt(0).toUpperCase() + selectedItem.status.replace('_', ' ').slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Total Bet</p>
                      <p className="font-medium text-green-600">{formatCurrency(selectedItem.totalBet)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Plazada Fee</p>
                      <p className="font-medium text-blue-600">{formatCurrency(selectedItem.plazadaFee)}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">Scheduled Time</p>
                    <p className="text-gray-900">{formatDate(selectedItem.scheduledTime)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Participants</h4>
                  <div className="space-y-2">
                    {selectedItem.participantsID?.map((participant, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-white rounded border">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{participant.participantName}</p>
                          <p className="text-sm text-gray-600">{participant.contactNumber}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Cock Profiles</h4>
                  <div className="space-y-2">
                    {selectedItem.cockProfileID?.map((cock, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-white rounded border">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{cock.legband}</p>
                          <p className="text-sm text-gray-600">{cock.ownerName} ({cock.weight}kg)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedItem.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-lg mb-3 text-gray-900">Notes</h4>
                    <p className="text-gray-900">{selectedItem.notes}</p>
                  </div>
                )}
              </div>
            )}

            {selectedItem.type === 'matchResult' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Match Result Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Fight Number</p>
                      <p className="font-medium text-gray-900">#{selectedItem.matchID?.fightNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedItem.status === 'final' ? 'bg-green-100 text-green-800' :
                        selectedItem.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        selectedItem.status === 'disputed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Total Bet</p>
                      <p className="font-medium text-green-600">{formatCurrency(selectedItem.totalBet)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Bet Winner</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedItem.betWinner === 'Meron' ? 'bg-blue-100 text-blue-800' :
                        selectedItem.betWinner === 'Wala' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedItem.betWinner}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">Match Start Time</p>
                    <p className="text-gray-900">{formatDate(selectedItem.matchStartTime)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Winner & Loser</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h5 className="font-medium text-green-800 mb-2">Winner</h5>
                      <p className="font-medium text-gray-900">{selectedItem.resultMatch?.winnerParticipantID?.participantName}</p>
                      <p className="text-sm text-gray-600">{selectedItem.resultMatch?.winnerCockProfileID?.legband} ({selectedItem.resultMatch?.winnerCockProfileID?.ownerName})</p>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h5 className="font-medium text-red-800 mb-2">Loser</h5>
                      <p className="font-medium text-gray-900">{selectedItem.resultMatch?.loserParticipantID?.participantName}</p>
                      <p className="text-sm text-gray-600">{selectedItem.resultMatch?.loserCockProfileID?.legband} ({selectedItem.resultMatch?.loserCockProfileID?.ownerName})</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">Prize Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Winner Prize</p>
                      <p className="font-medium text-green-600">{formatCurrency(selectedItem.prize?.winnerPrize)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">House Cut</p>
                      <p className="font-medium text-blue-600">{formatCurrency(selectedItem.prize?.houseCut)}</p>
                    </div>
                  </div>
                </div>

                {selectedItem.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-lg mb-3 text-gray-900">Notes</h4>
                    <p className="text-gray-900">{selectedItem.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CustomAlertDialog>
    </PageLayout>
  )
}

export default FightSchedule
