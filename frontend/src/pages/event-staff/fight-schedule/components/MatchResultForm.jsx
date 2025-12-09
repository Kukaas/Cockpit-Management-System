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
  const participantBets = formData.participantBets || []
  const isDrawOutcome = formData.winnerParticipantID === 'draw'
  const isCancelledOutcome = formData.winnerParticipantID === 'cancelled'
  const isSpecialOutcome = isDrawOutcome || isCancelledOutcome

  const handleWinnerSelection = (value) => {
    onInputChange('winnerParticipantID', value)

    if (value === 'draw' || value === 'cancelled') {
      onInputChange('loserParticipantID', '')
      onInputChange('winnerCockProfileID', '')
      onInputChange('loserCockProfileID', '')
      onInputChange('participantBets', [])
      return
    }

    const otherParticipant = participants.find(p => p._id !== value)
    if (otherParticipant) {
      onInputChange('loserParticipantID', otherParticipant._id)
    }

    if (value && selectedFight) {
      const winnerIndex = participants.findIndex(p => p._id === value)
      const loserIndex = participants.findIndex(p => p._id !== value && p._id)

      if (winnerIndex !== -1 && cockProfiles[winnerIndex]) {
        onInputChange('winnerCockProfileID', cockProfiles[winnerIndex]._id)
      }

      if (loserIndex !== -1 && cockProfiles[loserIndex]) {
        onInputChange('loserCockProfileID', cockProfiles[loserIndex]._id)
      }
    }
  }

  const getParticipantPosition = (participantId) => {
    if (!participantId || !participantBets || participantBets.length !== 2) return null
    const participantBet = participantBets.find(bet => {
      // Handle both object ID and string ID
      const betParticipantId = bet?.participantID?._id || bet?.participantID
      return betParticipantId === participantId || betParticipantId?.toString() === participantId?.toString()
    })
    const otherBet = participantBets.find(bet => {
      const betParticipantId = bet?.participantID?._id || bet?.participantID
      return betParticipantId !== participantId && betParticipantId?.toString() !== participantId?.toString()
    })

    if (!participantBet || !otherBet) return null

    // Check if both bets have valid amounts (not empty strings)
    const betAmount1 = participantBet.betAmount === '' ? null : (participantBet.betAmount || 0)
    const betAmount2 = otherBet.betAmount === '' ? null : (otherBet.betAmount || 0)

    // Return null if either bet amount is empty
    if (betAmount1 === null || betAmount2 === null) return null

    // Always calculate from current bet amounts to ensure correctness
    // Meron has the higher bet, Wala has the lower bet
    if (betAmount1 > betAmount2) return 'Meron'
    if (betAmount1 < betAmount2) return 'Wala'

    // If amounts are equal, use saved position if available, otherwise return null
    if (betAmount1 === betAmount2 && participantBet.position) {
      return participantBet.position
    }

    return null
  }

  // Calculate betting information
  const calculateBettingInfo = () => {
    if (isSpecialOutcome || participantBets.length !== 2) return null

    const [bet1, bet2] = participantBets

    // Check if both bets have valid amounts (not empty strings)
    const bet1Amount = bet1.betAmount === '' ? null : (bet1.betAmount || 0)
    const bet2Amount = bet2.betAmount === '' ? null : (bet2.betAmount || 0)

    // Return null if either bet amount is empty
    if (bet1Amount === null || bet2Amount === null) return null

    // Use saved position if available (from edit mode), otherwise calculate from bet amounts
    let meronBet, walaBet
    if (bet1.position === 'Meron' || bet2.position === 'Meron') {
      // If position is saved, use it
      meronBet = bet1.position === 'Meron' ? bet1 : bet2
      walaBet = bet1.position === 'Meron' ? bet2 : bet1
    } else if (bet1.position === 'Wala' || bet2.position === 'Wala') {
      // If position is saved, use it
      walaBet = bet1.position === 'Wala' ? bet1 : bet2
      meronBet = bet1.position === 'Wala' ? bet2 : bet1
    } else {
      // Calculate from bet amounts if position not saved
      // Meron has the higher bet, Wala has the lower bet
      meronBet = bet1Amount > bet2Amount ? bet1 : bet2
      walaBet = bet1Amount > bet2Amount ? bet2 : bet1
    }

    const gap = Math.max(0, (meronBet.betAmount || 0) - (walaBet.betAmount || 0)) // Outside bets only exist when Meron > Wala

    // Calculate plazada from the loser (10% of loser's bet)
    let loserPlazada = 0
    let meronPayout = 0
    let walaPayout = 0
    let loserBet = null

    if (formData.winnerParticipantID && !isSpecialOutcome) {
      // Handle both object ID and string ID when finding bets
      const winnerBet = participantBets.find(bet => {
        const betParticipantId = bet?.participantID?._id || bet?.participantID
        const winnerId = formData.winnerParticipantID?._id || formData.winnerParticipantID
        return betParticipantId === winnerId || betParticipantId?.toString() === winnerId?.toString()
      })
      loserBet = participantBets.find(bet => {
        const betParticipantId = bet?.participantID?._id || bet?.participantID
        const winnerId = formData.winnerParticipantID?._id || formData.winnerParticipantID
        return betParticipantId !== winnerId && betParticipantId?.toString() !== winnerId?.toString()
      })

      if (winnerBet && loserBet) {
        // Plazada is collected from the loser (10% of loser's bet)
        loserPlazada = (loserBet.betAmount || 0) * 0.10

        // Winner gets their bet amount back (no plazada deduction)
        const meronParticipantId = meronBet?.participantID?._id || meronBet?.participantID
        const winnerId = formData.winnerParticipantID?._id || formData.winnerParticipantID
        const winnerIsMeron = meronParticipantId === winnerId || meronParticipantId?.toString() === winnerId?.toString()

        if (winnerIsMeron) {
          meronPayout = meronBet.betAmount || 0
          walaPayout = 0
        } else {
          walaPayout = walaBet.betAmount || 0
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
    // Allow empty string, only calculate if both fields have values
    if (value === '' && matchSeconds === '') {
      onInputChange('matchTimeSeconds', 0)
    } else {
      const totalSeconds = minutesAndSecondsToSeconds(value, matchSeconds)
      onInputChange('matchTimeSeconds', totalSeconds)
    }
  }

  const handleSecondsChange = (value) => {
    setMatchSeconds(value)
    // Allow empty string, only calculate if both fields have values
    if (value === '' && matchMinutes === '') {
      onInputChange('matchTimeSeconds', 0)
    } else {
      const totalSeconds = minutesAndSecondsToSeconds(matchMinutes, value)
      onInputChange('matchTimeSeconds', totalSeconds)
    }
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

        {/* Participant Bets - Read Only Display */}
        {!isSpecialOutcome && participantBets.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Participant Bets</h4>
              <span className="text-xs text-muted-foreground">
                Bets recorded during bet entry phase
              </span>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {participants.map((participant) => {
                  const participantBet = participantBets.find(bet => {
                    const betParticipantId = bet?.participantID?._id || bet?.participantID
                    const participantId = participant._id
                    return betParticipantId === participantId || betParticipantId?.toString() === participantId?.toString()
                  })

                  if (!participantBet) return null

                  const position = getParticipantPosition(participant._id)

                  return (
                    <div key={participant._id} className={`p-4 rounded-lg border-2 ${position === 'Meron'
                      ? 'bg-red-50 border-red-300'
                      : position === 'Wala'
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-gray-50 border-gray-300'
                      }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{participant.participantName}</span>
                        {position && (
                          <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${position === 'Meron'
                            ? 'bg-red-200 text-red-800'
                            : 'bg-blue-200 text-blue-800'
                            }`}>
                            {position}
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        ₱{participantBet.betAmount?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Bet Amount</div>
                    </div>
                  )
                })}
              </div>

              {/* Betting Summary */}
              {bettingInfo && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Total Pool</div>
                      <div className="font-semibold text-gray-900">
                        ₱{(bettingInfo.meronBet.betAmount + bettingInfo.walaBet.betAmount + bettingInfo.outsideBets)?.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Outside Bets</div>
                      <div className="font-semibold text-gray-700">
                        ₱{bettingInfo.outsideBets?.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Plazada (10%)</div>
                      <div className="font-semibold text-green-700">
                        ₱{bettingInfo.loserPlazada?.toLocaleString() || '0'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Warning if no bets recorded */}
        {!isSpecialOutcome && participantBets.length === 0 && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-orange-800">No Bets Recorded</p>
                <p className="text-sm text-orange-700">Please record bets for this fight before adding the match result.</p>
              </div>
            </div>
          </div>
        )}

        {/* Match Result */}
        <div className="space-y-4">
          <h4 className="font-medium">Match Result</h4>
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Winner Participant *
            </Label>

            {/* Participant Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {participants.map((participant) => {
                const position = getParticipantPosition(participant._id)
                // Handle both string and object ID comparison
                const winnerId = formData.winnerParticipantID?._id || formData.winnerParticipantID
                const participantId = participant._id
                const isSelected = winnerId === participantId || winnerId?.toString() === participantId?.toString()
                const isMeron = position === 'Meron'
                const isWala = position === 'Wala'

                return (
                  <Button
                    key={participant._id}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleWinnerSelection(participant._id)}
                    className={`w-full justify-start h-auto py-3 px-4 ${isSelected
                      ? isMeron
                        ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                        : isWala
                          ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                          : 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                      : isMeron
                        ? 'hover:bg-red-50 border-red-600 text-red-700'
                        : isWala
                          ? 'hover:bg-blue-50 border-blue-600 text-blue-700'
                          : 'hover:bg-gray-50 border-gray-300'
                      }`}
                  >
                    <div className="flex flex-col items-start w-full gap-1">
                      {position && (
                        <span className={`text-xs font-semibold uppercase ${isSelected
                          ? 'text-white opacity-90'
                          : isMeron
                            ? 'text-red-600'
                            : isWala
                              ? 'text-blue-600'
                              : 'text-gray-500'
                          }`}>
                          {position}
                        </span>
                      )}
                      <span className="font-medium">{participant.participantName}</span>
                    </div>
                  </Button>
                )
              })}
            </div>

            {/* Special Outcome Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant={formData.winnerParticipantID === 'draw' ? "default" : "outline"}
                onClick={() => handleWinnerSelection('draw')}
                className={`w-full justify-start h-auto py-3 px-4 ${formData.winnerParticipantID === 'draw'
                  ? 'bg-lime-600 hover:bg-lime-700 text-white border-lime-600'
                  : 'hover:bg-lime-50 border-lime-600 text-lime-700'
                  }`}
              >
                <div className="flex flex-col items-start w-full">
                  <span className="font-medium">Draw (no winner)</span>
                </div>
              </Button>

              <Button
                type="button"
                variant={formData.winnerParticipantID === 'cancelled' ? "default" : "outline"}
                onClick={() => handleWinnerSelection('cancelled')}
                className={`w-full justify-start h-auto py-3 px-4 ${formData.winnerParticipantID === 'cancelled'
                  ? 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600'
                  : 'hover:bg-gray-50 border-gray-600 text-gray-700'
                  }`}
              >
                <div className="flex flex-col items-start w-full">
                  <span className="font-medium">Cancelled</span>
                </div>
              </Button>
            </div>
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
        {bettingInfo && formData.winnerParticipantID && !isSpecialOutcome && (
          <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 font-semibold text-sm">₱</span>
              </div>
              <h5 className="font-semibold text-lg text-gray-900">Betting Result Preview</h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Meron Bet */}
              {/* <div className="bg-white p-4 rounded-lg border border-emerald-100">
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
              </div> */}

              {/* Wala Bet */}
              {/* <div className="bg-white p-4 rounded-lg border border-emerald-100">
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
              </div> */}
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
                    if (!formData.winnerParticipantID) {
                      return 'Select winner to see payout'
                    }

                    // Get the winner participant (handle both string and object IDs)
                    const winnerId = formData.winnerParticipantID?._id || formData.winnerParticipantID
                    const winnerParticipant = participants.find(p => {
                      const pId = p._id
                      return pId === winnerId || pId?.toString() === winnerId?.toString()
                    })
                    const winnerPosition = winnerParticipant ? getParticipantPosition(winnerParticipant._id) : null
                    const winnerBet = participantBets.find(bet => {
                      const betParticipantId = bet?.participantID?._id || bet?.participantID
                      return betParticipantId === winnerId || betParticipantId?.toString() === winnerId?.toString()
                    })

                    if (winnerBet && winnerParticipant && bettingInfo) {
                      const meronParticipantId = bettingInfo.meronBet?.participantID?._id || bettingInfo.meronBet?.participantID
                      const isMeron = meronParticipantId === winnerId || meronParticipantId?.toString() === winnerId?.toString()
                      const positionLabel = winnerPosition ? `${winnerPosition} - ` : ''
                      if (isMeron) {
                        return `${positionLabel}${winnerParticipant.participantName} wins! Gets ₱${bettingInfo.meronPayout?.toLocaleString()}`
                      } else {
                        return `${positionLabel}${winnerParticipant.participantName} wins! Gets ₱${bettingInfo.walaPayout?.toLocaleString()}`
                      }
                    }
                    return 'Select winner to see payout'
                  })()}
                </div>
              </div>
            </div>

            {/* Loser Pays */}
            {bettingInfo.loserBet && (
              <div className="mt-4 bg-gradient-to-r from-red-50 to-rose-50 p-4 rounded-lg border border-red-200">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Loser Pays</div>
                  <div className="font-bold text-lg text-red-800">
                    Loser pays: ₱{bettingInfo.loserBet.betAmount?.toLocaleString()} + ₱{bettingInfo.loserPlazada?.toLocaleString()} plazada = ₱{(bettingInfo.loserBet.betAmount + bettingInfo.loserPlazada)?.toLocaleString()} total
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </CustomAlertDialog>
  )
}

export default MatchResultForm
