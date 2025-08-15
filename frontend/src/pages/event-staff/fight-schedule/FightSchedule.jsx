import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { toast } from 'sonner'
import { useGetAll, useGetById } from '@/hooks/useApiQueries'
import { useCreateMutation, usePutMutation, useCustomMutation } from '@/hooks/useApiMutations'
import api from '@/services/api'
import ConfirmationDialog from '@/components/custom/ConfirmationDialog'

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

  // Fetch participants for this event (get all registered participants)
  const { data: participantsData = [] } = useGetAll(`/participants/event/${eventId}`)

  // Fetch all cock profiles
  const { data: cockProfilesData = [] } = useGetAll('/cock-profiles?isActive=true')

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

  const handleEditResultClick = (result) => {
    setSelectedResult(result)
    setResultFormData({
      winnerParticipantID: result.resultMatch.winnerParticipantID._id,
      loserParticipantID: result.resultMatch.loserParticipantID._id,
      winnerCockProfileID: result.resultMatch.winnerCockProfileID._id,
      loserCockProfileID: result.resultMatch.loserCockProfileID._id,
      matchStartTime: formatDateTimeLocal(result.matchStartTime),
      matchEndTime: formatDateTimeLocal(result.matchEndTime),
      matchType: result.resultMatch.matchType,
      description: result.resultMatch.description || '',
      notes: result.notes || ''
    })
    setEditResultDialogOpen(true)
  }

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
    handleAddResultClick
  )

  const resultColumns = createMatchResultColumns(
    formatCurrency,
    formatDate,
    handleEditResultClick,
    handleDeleteResultClick,
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
    </PageLayout>
  )
}

export default FightSchedule
