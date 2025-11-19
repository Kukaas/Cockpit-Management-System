import React, { useState, useEffect } from 'react'
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
  // Get participants and cock profiles from selected fight
  const participants = selectedFight?.participantsID || []
  const cockProfiles = selectedFight?.cockProfileID || []

  // Calculate betting information
  const calculateBettingInfo = () => {
    if (!formData.participantBets || formData.participantBets.length !== 2) return null

    const [bet1, bet2] = formData.participantBets
    const meronBet = bet1.betAmount > bet2.betAmount ? bet1 : bet2
    const walaBet = bet1.betAmount > bet2.betAmount ? bet2 : bet1

    const gap = Math.max(0, meronBet.betAmount - walaBet.betAmount) // Outside bets only exist when Meron > Wala

    // Calculate plazada from the loser (10% of loser's bet)
    let loserPlazada = 0
    let meronPayout = 0
    let walaPayout = 0
    let loserBet = null

    if (formData.winnerParticipantID) {
      const winnerBet = formData.participantBets.find(bet => bet.participantID === formData.winnerParticipantID)
      loserBet = formData.participantBets.find(bet => bet.participantID !== formData.winnerParticipantID)

      if (winnerBet && loserBet) {
        // Plazada is collected from the loser (10% of loser's bet)
        loserPlazada = loserBet.betAmount * 0.10

        // Winner gets their bet amount back (no plazada deduction)
        const winnerIsMeron = meronBet.participantID === formData.winnerParticipantID
        if (winnerIsMeron) {
          meronPayout = meronBet.betAmount
          walaPayout = 0
        } else {
          walaPayout = walaBet.betAmount
          meronPayout = 0
        }
      }
    }

    return {
      meronBet,
      walaBet,
      meronPayout,
      walaPayout,
      outsideBets: gap,
      loserPlazada,
      totalPlazada: loserPlazada,
      loserBet
    }
  }

  const bettingInfo = calculateBettingInfo()

  // Helper functions to convert between seconds and minutes/seconds
  const secondsToMinutesAndSeconds = (totalSeconds) => {
    if (!totalSeconds || totalSeconds === 0) return { minutes: 0, seconds: 0 }
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.round((totalSeconds % 60) * 100) / 100 // Round to 2 decimal places
    return { minutes, seconds }
  }

  const minutesAndSecondsToSeconds = (minutes, seconds) => {
    const mins = parseFloat(minutes) || 0
    const secs = parseFloat(seconds) || 0
    return mins * 60 + secs
  }

  // Get current minutes and seconds from formData.matchTimeSeconds
  const timeDisplay = secondsToMinutesAndSeconds(formData.matchTimeSeconds || 0)
  const [matchMinutes, setMatchMinutes] = useState(timeDisplay.minutes.toString())
  const [matchSeconds, setMatchSeconds] = useState(timeDisplay.seconds.toString())

  // Update local state when formData.matchTimeSeconds changes (for edit mode)
  useEffect(() => {
    const timeDisplay = secondsToMinutesAndSeconds(formData.matchTimeSeconds || 0)
    setMatchMinutes(timeDisplay.minutes.toString())
    setMatchSeconds(timeDisplay.seconds.toString())
  }, [formData.matchTimeSeconds])

  // Handle time input changes
  const handleMinutesChange = (value) => {
    setMatchMinutes(value)
    const totalSeconds = minutesAndSecondsToSeconds(value, matchSeconds)
    onInputChange('matchTimeSeconds', totalSeconds)
  }

  const handleSecondsChange = (value) => {
    setMatchSeconds(value)
    const totalSeconds = minutesAndSecondsToSeconds(matchMinutes, value)
    onInputChange('matchTimeSeconds', totalSeconds)
  }

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
        {event?.eventType === 'fastest_kill' && (
          <div className="space-y-4">
            <h4 className="font-medium">Match Timing</h4>
            {/* Only show time inputs for fastest kill events */}
            {event?.eventType === 'fastest_kill' && (
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  id={isEdit ? "editMatchMinutes" : "matchMinutes"}
                  label="Minutes *"
                  type="number"
                  value={matchMinutes}
                  onChange={(e) => handleMinutesChange(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="1"
                  required
                />
                <InputField
                  id={isEdit ? "editMatchSeconds" : "matchSeconds"}
                  label="Seconds *"
                  type="number"
                  value={matchSeconds}
                  onChange={(e) => handleSecondsChange(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  max="59.99"
                  step="0.01"
                  required
                />
              </div>
            )}
          </div>
        )}


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
                      <span className="text-xs text-gray-500">
                        {bettingInfo.loserBet?.participantID === bettingInfo.meronBet.participantID
                          ? 'Plazada (if loses):'
                          : 'Payout (if wins):'}
                      </span>
                      <span className={`font-semibold ${bettingInfo.loserBet?.participantID === bettingInfo.meronBet.participantID ? 'text-red-600' : 'text-emerald-600'}`}>
                        {bettingInfo.loserBet?.participantID === bettingInfo.meronBet.participantID
                          ? `₱${(bettingInfo.meronBet.betAmount * 0.10)?.toLocaleString()}`
                          : `₱${bettingInfo.meronBet.betAmount?.toLocaleString()}`
                        }
                      </span>
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
                      <span className="text-xs text-gray-500">
                        {bettingInfo.loserBet?.participantID === bettingInfo.walaBet.participantID
                          ? 'Plazada (if loses):'
                          : 'Payout (if wins):'}
                      </span>
                      <span className={`font-semibold ${bettingInfo.loserBet?.participantID === bettingInfo.walaBet.participantID ? 'text-red-600' : 'text-emerald-600'}`}>
                        {bettingInfo.loserBet?.participantID === bettingInfo.walaBet.participantID
                          ? `₱${(bettingInfo.walaBet.betAmount * 0.10)?.toLocaleString()}`
                          : `₱${bettingInfo.walaBet.betAmount?.toLocaleString()}`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            {/* <div className="bg-white p-4 rounded-lg border border-emerald-100">
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
            </div> */}

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
                        return `Meron wins! Gets ₱${bettingInfo.meronPayout?.toLocaleString()}`
                      } else {
                        return `Wala wins! Gets ₱${bettingInfo.walaPayout?.toLocaleString()}`
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
