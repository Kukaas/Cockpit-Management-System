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
import DetailsDialog from './components/DetailsDialog'
import ChampionshipTab from './components/ChampionshipTab'
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
    cockProfile2: ''
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
  const { data: availableData = {} } = useGetAll(`/fight-schedules/event/${eventId}/available-participants`)
  const participantsData = availableData.participants || []
  const cockProfilesData = availableData.cockProfiles || []

  // Show all participants, but only active cock profiles
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
      cockProfile2: ''
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
    const requiredFields = ['participant1', 'participant2', 'cockProfile1', 'cockProfile2']
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

    const fightData = {
      eventID: eventId,
      participantsID: [fightFormData.participant1, fightFormData.participant2],
      cockProfileID: [fightFormData.cockProfile1, fightFormData.cockProfile2]
    }

    createFightMutation.mutate(fightData)
  }

  const handleAddResult = async () => {
    // Base required fields for all events
    const baseRequiredFields = ['winnerParticipantID', 'loserParticipantID', 'winnerCockProfileID', 'loserCockProfileID', 'matchType']

    // Add timing fields only for fastest kill events
    const requiredFields = event?.eventType === 'fastest_kill'
      ? [...baseRequiredFields, 'matchStartTime', 'matchEndTime']
      : baseRequiredFields

    const missingFields = requiredFields.filter(field => !resultFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields`)
      return
    }

    // Calculate betting totals for backend
    const participantBets = resultFormData.participantBets || []
    if (participantBets.length !== 2) {
      toast.error('Please enter bet amounts for both participants')
      return
    }

    const [bet1, bet2] = participantBets
    const meronBet = bet1.betAmount > bet2.betAmount ? bet1 : bet2
    const walaBet = bet1.betAmount > bet2.betAmount ? bet2 : bet1

    const gap = Math.max(0, meronBet.betAmount - walaBet.betAmount) // Gap filled by outside bets (only positive)
    const totalBetPool = meronBet.betAmount + walaBet.betAmount + gap // Total: Meron + Wala + Outside bets

    // Plazada will be calculated in the model based on winner
    const resultData = {
      matchID: selectedFight._id,
      participantBets,
      totalBetPool,
      winnerParticipantID: resultFormData.winnerParticipantID,
      loserParticipantID: resultFormData.loserParticipantID,
      winnerCockProfileID: resultFormData.winnerCockProfileID,
      loserCockProfileID: resultFormData.loserCockProfileID,
      matchType: resultFormData.matchType
    }

    // Only include match times for fastest kill events
    if (event?.eventType === 'fastest_kill') {
      resultData.matchStartTime = resultFormData.matchStartTime
      resultData.matchEndTime = resultFormData.matchEndTime
    }
    // For Derby/Regular events, don't include match times at all

    createResultMutation.mutate(resultData)
  }

  // Action handlers
  const handleEditFightClick = (fight) => {
    setSelectedFight(fight)

    // Populate form with fight data
    setFightFormData({
      participant1: fight.participantsID[0]?._id || '',
      participant2: fight.participantsID[1]?._id || '',
      cockProfile1: fight.cockProfileID[0]?._id || '',
      cockProfile2: fight.cockProfileID[1]?._id || ''
    })
    setEditFightDialogOpen(true)
  }

  const handleDeleteFightClick = (fight) => {
    setSelectedFight(fight)
    setDeleteFightDialogOpen(true)
  }

  const handleAddResultClick = (fight) => {
    setSelectedFight(fight)
    // Pre-populate with default values
    setResultFormData(prev => ({
      ...prev,
      // We'll let user select winner/loser from the fight participants
    }))
    setAddResultDialogOpen(true)
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

  // Handle view details
  const handleViewDetails = (item, type) => {
    setSelectedItem({ ...item, type })
    setDetailDialogOpen(true)
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
    handleStatusChange,
    event?.eventType
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
        eventType={event.eventType}
      />

      {/* Championship Tab Content for Derby Events */}
      {event.eventType === 'derby' && activeTab === 'championship' && (
        <ChampionshipTab
          eventId={eventId}
          eventType={event.eventType}
          formatCurrency={formatCurrency}
        />
      )}

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
        event={event}
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

          const fightData = {}

          updateFightMutation.mutate({ id: selectedFight._id, data: fightData })
        }}
        onCancel={() => setEditFightDialogOpen(false)}
        isPending={updateFightMutation.isPending}
        availableParticipants={availableParticipants}
        availableCockProfiles={availableCockProfiles}
        isEdit={true}
        event={event}
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
        event={event}
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

          // Calculate betting totals for backend
          const participantBets = resultFormData.participantBets || []
          if (participantBets.length === 2) {
            const [bet1, bet2] = participantBets
            const meronBet = bet1.betAmount > bet2.betAmount ? bet1 : bet2
            const walaBet = bet1.betAmount > bet2.betAmount ? bet2 : bet1

            const gap = Math.max(0, meronBet.betAmount - walaBet.betAmount) // Gap filled by outside bets (only positive)
            const totalBetPool = meronBet.betAmount + walaBet.betAmount + gap // Total: Meron + Wala + Outside bets

            // Plazada will be calculated in the model based on winner
            const updateData = {
              ...resultFormData,
              participantBets,
              totalBetPool
            }
            updateResultMutation.mutate({ id: selectedResult._id, data: updateData })
          } else {
            updateResultMutation.mutate({ id: selectedResult._id, data: resultFormData })
          }
        }}
        onCancel={() => setEditResultDialogOpen(false)}
        isPending={updateResultMutation.isPending}
        selectedFight={selectedResult?.matchID}
        isEdit={true}
        event={event}
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
      <DetailsDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        selectedItem={selectedItem}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        event={event}
      />
    </PageLayout>
  )
}

export default FightSchedule
