import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'
import NativeSelect from '@/components/custom/NativeSelect'

const MatchResultForm = ({
  open,
  onOpenChange,
  title,
  description,
  formData,
  onInputChange,
  onSubmit,
  onCancel,
  isPending,
  selectedFight,
  isEdit = false,
  event = null
}) => {
  const matchTypes = [
    { value: 'knockout', label: 'Knockout' },
    { value: 'decision', label: 'Decision' },
    { value: 'disqualification', label: 'Disqualification' },
    { value: 'forfeit', label: 'Forfeit' }
  ]

  // Get participants and cock profiles from selected fight
  const participants = selectedFight?.participantsID || []
  const cockProfiles = selectedFight?.cockProfileID || []

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

  // Helper function to get default match end time (event date + current time)
  const getDefaultMatchEndTime = () => {
    if (!event?.date) return ''

    const eventDate = new Date(event.date)
    const now = new Date()

    // Set the time to current time but keep the event date
    eventDate.setHours(now.getHours())
    eventDate.setMinutes(now.getMinutes())

    // Format to YYYY-MM-DDTHH:mm
    const year = eventDate.getFullYear()
    const month = String(eventDate.getMonth() + 1).padStart(2, '0')
    const day = String(eventDate.getDate()).padStart(2, '0')
    const hours = String(eventDate.getHours()).padStart(2, '0')
    const minutes = String(eventDate.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Set default match end time when form opens and no time is set
  React.useEffect(() => {
    if (open && !formData.matchEndTime && event) {
      const defaultTime = getDefaultMatchEndTime()
      if (defaultTime) {
        onInputChange('matchEndTime', defaultTime)
      }
    }
  }, [open, formData.matchEndTime, event, onInputChange])

  // Calculate betting information
  const calculateBettingInfo = () => {
    if (!formData.participantBets || formData.participantBets.length !== 2) return null

    const [bet1, bet2] = formData.participantBets
    const meronBet = bet1.betAmount > bet2.betAmount ? bet1 : bet2
    const walaBet = bet1.betAmount > bet2.betAmount ? bet2 : bet1

    const gap = Math.max(0, meronBet.betAmount - walaBet.betAmount) // Gap filled by outside bets (only positive)
    const totalBetPool = meronBet.betAmount + walaBet.betAmount + gap // Total: Meron + Wala + Outside bets

    // Calculate plazada only for the winner (10% of winner's bet)
    let winnerPlazada = 0
    let meronPayout = 0
    let walaPayout = 0

    if (formData.winnerParticipantID) {
      const winnerBet = formData.participantBets.find(bet => bet.participantID === formData.winnerParticipantID)
      if (winnerBet) {
        winnerPlazada = winnerBet.betAmount * 0.10

        // Calculate payouts: winner gets their bet + opponent's bet + outside bets - plazada
        if (meronBet.participantID === formData.winnerParticipantID) {
          // When Meron wins, they get their bet + opponent's bet + outside bets - plazada
          meronPayout = meronBet.betAmount + walaBet.betAmount + gap - winnerPlazada
          walaPayout = 0
        } else {
          // When Wala wins, they get their bet + the smaller bet amount - plazada
          walaPayout = walaBet.betAmount + walaBet.betAmount - winnerPlazada
          meronPayout = 0
        }
      }
    }

    return {
      meronBet,
      walaBet,
      totalBetPool,
      meronPayout,
      walaPayout,
      outsideBets: gap, // Gap filled by others
      winnerPlazada,
      totalPlazada: winnerPlazada
    }
  }

  const bettingInfo = calculateBettingInfo()

  return (
    <CustomAlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      maxHeight="max-h-[90vh]"
      actions={
        <>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isPending}>
            {isPending ? (isEdit ? 'Updating...' : 'Recording...') : (isEdit ? 'Update Result' : 'Record Result')}
          </Button>
        </>
      }
    >
      <div className="space-y-6 overflow-y-auto pr-2">
        {/* Fight Information */}
        {selectedFight && (
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">#</span>
              </div>
              <h4 className="font-semibold text-lg text-gray-900">Fight Information</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">Fight Details</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fight Number:</span>
                    <span className="font-semibold text-blue-600">#{selectedFight.fightNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {selectedFight.status?.replace('_', ' ').charAt(0).toUpperCase() + selectedFight.status?.replace('_', ' ').slice(1) || 'Scheduled'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">Participants</span>
                </div>
                <div className="space-y-2">
                  {participants.map((participant, index) => (
                    <div key={participant._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                      <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{participant.participantName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Participant Bets */}
        <div className="space-y-4">
          <h4 className="font-medium">Participant Bets</h4>
          {participants.map((participant, index) => (
            <div key={participant._id} className="space-y-2">
              <Label className="text-sm font-medium">
                {participant.participantName} Bet Amount *
              </Label>
              <InputField
                type="number"
                min="0"
                step="0.01"
                value={formData.participantBets?.[index]?.betAmount || ''}
                onChange={(e) => {
                  const newBets = [...(formData.participantBets || [])]
                  newBets[index] = {
                    ...newBets[index],
                    participantID: participant._id,
                    betAmount: parseFloat(e.target.value) || 0
                  }
                  onInputChange('participantBets', newBets)
                }}
                placeholder="Enter bet amount"
                required
              />
            </div>
          ))}
        </div>

        {/* Match Result */}
        <div className="space-y-4">
          <h4 className="font-medium">Match Result</h4>
          <div className="space-y-2">
            <Label htmlFor={isEdit ? "editWinnerParticipant" : "winnerParticipant"} className="text-sm font-medium">
              Winner Participant *
            </Label>
            <NativeSelect
              id={isEdit ? "editWinnerParticipant" : "winnerParticipant"}
              value={formData.winnerParticipantID}
              onChange={(e) => {
                onInputChange('winnerParticipantID', e.target.value)

                // Auto-set loser participant
                const otherParticipant = participants.find(p => p._id !== e.target.value)
                if (otherParticipant) {
                  onInputChange('loserParticipantID', otherParticipant._id)
                }

                // Auto-set winner and loser cock profiles based on participant selection
                if (e.target.value && selectedFight) {
                  const winnerIndex = participants.findIndex(p => p._id === e.target.value)
                  const loserIndex = participants.findIndex(p => p._id !== e.target.value && p._id)

                  if (winnerIndex !== -1 && cockProfiles[winnerIndex]) {
                    onInputChange('winnerCockProfileID', cockProfiles[winnerIndex]._id)
                  }

                  if (loserIndex !== -1 && cockProfiles[loserIndex]) {
                    onInputChange('loserCockProfileID', cockProfiles[loserIndex]._id)
                  }
                }
              }}
              required
            >
              <option value="">Select Winner</option>
              {participants.map((participant) => (
                <option key={participant._id} value={participant._id}>
                  {participant.participantName}
                </option>
              ))}
            </NativeSelect>
          </div>

          {/* Hidden fields for auto-selected values - still saved to database */}
          <input
            type="hidden"
            value={formData.loserParticipantID || ''}
            onChange={(e) => onInputChange('loserParticipantID', e.target.value)}
          />
          <input
            type="hidden"
            value={formData.winnerCockProfileID || ''}
            onChange={(e) => onInputChange('winnerCockProfileID', e.target.value)}
          />
          <input
            type="hidden"
            value={formData.loserCockProfileID || ''}
            onChange={(e) => onInputChange('loserCockProfileID', e.target.value)}
          />
        </div>

        {/* Match Timing */}
        <div className="space-y-4">
          <h4 className="font-medium">Match Timing</h4>
          <div className="space-y-4">
            <InputField
              id={isEdit ? "editMatchStartTime" : "matchStartTime"}
              label="Match Start Time *"
              type="datetime-local"
              value={formData.matchStartTime || formatDateTimeLocal(selectedFight?.scheduledTime)}
              onChange={(e) => onInputChange('matchStartTime', e.target.value)}
              required
            />
            <InputField
              id={isEdit ? "editMatchEndTime" : "matchEndTime"}
              label="Match End Time *"
              type="datetime-local"
              value={formData.matchEndTime}
              onChange={(e) => onInputChange('matchEndTime', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Match Type */}
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "editMatchType" : "matchType"} className="text-sm font-medium">
            Match Type *
          </Label>
          <NativeSelect
            id={isEdit ? "editMatchType" : "matchType"}
            value={formData.matchType}
            onChange={(e) => onInputChange('matchType', e.target.value)}
            required
          >
            {matchTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </NativeSelect>
        </div>

        {/* Betting Result Preview */}
        {bettingInfo && formData.winnerParticipantID && (
          <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 font-semibold text-sm">₱</span>
              </div>
              <h5 className="font-semibold text-lg text-gray-900">Betting Result Preview</h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Meron Bet */}
              <div className="bg-white p-4 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-semibold text-blue-700">Meron</span>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    {participants.find(p => p._id === bettingInfo.meronBet.participantID)?.participantName}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Bet Amount:</span>
                      <span className="font-semibold text-gray-900">₱{bettingInfo.meronBet.betAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Plazada (if wins):</span>
                      <span className="font-semibold text-emerald-600">₱{(bettingInfo.meronBet.betAmount * 0.10)?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wala Bet */}
              <div className="bg-white p-4 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="font-semibold text-gray-700">Wala</span>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    {participants.find(p => p._id === bettingInfo.walaBet.participantID)?.participantName}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Bet Amount:</span>
                      <span className="font-semibold text-gray-900">₱{bettingInfo.walaBet.betAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Plazada (if wins):</span>
                      <span className="font-semibold text-emerald-600">₱{(bettingInfo.walaBet.betAmount * 0.10)?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white p-4 rounded-lg border border-emerald-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Summary</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Total Bet Pool</div>
                  <div className="font-semibold text-blue-700">₱{bettingInfo.totalBetPool?.toLocaleString()}</div>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Plazada Collected</div>
                  <div className="font-semibold text-emerald-700">₱{bettingInfo.winnerPlazada?.toLocaleString() || '0'}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Outside Bets</div>
                  <div className="font-semibold text-gray-700">₱{bettingInfo.outsideBets?.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Winner Payout */}
            <div className="mt-4 bg-gradient-to-r from-emerald-100 to-green-100 p-4 rounded-lg border border-emerald-200">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Winner Payout</div>
                <div className="font-bold text-lg text-emerald-800">
                  {(() => {
                    const winnerBet = formData.participantBets?.find(bet => bet.participantID === formData.winnerParticipantID)
                    if (winnerBet) {
                      const isMeron = bettingInfo.meronBet.participantID === formData.winnerParticipantID
                      if (isMeron) {
                        return `Meron wins! ₱${bettingInfo.meronPayout?.toLocaleString()} (Bet: ₱${bettingInfo.meronBet.betAmount?.toLocaleString()} + Opponent: ₱${bettingInfo.walaBet.betAmount?.toLocaleString()} + Outside: ₱${bettingInfo.outsideBets?.toLocaleString()} - Plazada: ₱${bettingInfo.winnerPlazada?.toLocaleString()})`
                      } else {
                        return `Wala wins! ₱${bettingInfo.walaPayout?.toLocaleString()} (Bet: ₱${bettingInfo.walaBet.betAmount?.toLocaleString()} + Opponent: ₱${bettingInfo.walaBet.betAmount?.toLocaleString()} - Plazada: ₱${bettingInfo.winnerPlazada?.toLocaleString()})`
                      }
                    }
                    return 'Select winner to see payout'
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomAlertDialog>
  )
}

export default MatchResultForm
