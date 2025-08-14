import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  isEdit = false
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
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Fight Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Fight #:</span>
                <span className="ml-2">{selectedFight.fightNumber}</span>
              </div>
              <div>
                <span className="font-medium">Total Bet:</span>
                <span className="ml-2">₱{selectedFight.totalBet?.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-sm">
                <span className="font-medium">Participants:</span>
              </div>
              {participants.map((participant, index) => (
                <div key={participant._id} className="text-sm text-muted-foreground ml-4">
                  {index + 1}. {participant.participantName}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Match Result */}
        <div className="space-y-4">
          <h4 className="font-medium">Match Result</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor={isEdit ? "editLoserParticipant" : "loserParticipant"} className="text-sm font-medium">
                Loser Participant *
              </Label>
              <NativeSelect
                id={isEdit ? "editLoserParticipant" : "loserParticipant"}
                value={formData.loserParticipantID}
                onChange={(e) => onInputChange('loserParticipantID', e.target.value)}
                required
                disabled
              >
                <option value="">Auto-selected</option>
                {participants.map((participant) => (
                  <option key={participant._id} value={participant._id}>
                    {participant.participantName}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
        </div>

        {/* Cock Profiles */}
        <div className="space-y-4">
          <h4 className="font-medium">Cock Profiles</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={isEdit ? "editWinnerCock" : "winnerCock"} className="text-sm font-medium">
                Winner Cock Profile *
              </Label>
              <NativeSelect
                id={isEdit ? "editWinnerCock" : "winnerCock"}
                value={formData.winnerCockProfileID}
                onChange={(e) => onInputChange('winnerCockProfileID', e.target.value)}
                required
                disabled
              >
                <option value="">Auto-selected based on participant</option>
                {cockProfiles.map((cock) => (
                  <option key={cock._id} value={cock._id}>
                    {cock.legband} - {cock.weight}kg ({cock.ownerName})
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-2">
              <Label htmlFor={isEdit ? "editLoserCock" : "loserCock"} className="text-sm font-medium">
                Loser Cock Profile *
              </Label>
              <NativeSelect
                id={isEdit ? "editLoserCock" : "loserCock"}
                value={formData.loserCockProfileID}
                onChange={(e) => onInputChange('loserCockProfileID', e.target.value)}
                required
                disabled
              >
                <option value="">Auto-selected based on participant</option>
                {cockProfiles.map((cock) => (
                  <option key={cock._id} value={cock._id}>
                    {cock.legband} - {cock.weight}kg ({cock.ownerName})
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
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

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "editMatchDescription" : "matchDescription"} className="text-sm font-medium">
            Match Description
          </Label>
          <Textarea
            id={isEdit ? "editMatchDescription" : "matchDescription"}
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Describe what happened in the match (optional)"
            rows={3}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "editResultNotes" : "resultNotes"} className="text-sm font-medium">
            Additional Notes
          </Label>
          <Textarea
            id={isEdit ? "editResultNotes" : "resultNotes"}
            value={formData.notes}
            onChange={(e) => onInputChange('notes', e.target.value)}
            placeholder="Enter additional notes (optional)"
            rows={2}
          />
        </div>

        {/* Betting Result Preview */}
        {selectedFight && formData.winnerParticipantID && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h5 className="font-medium text-sm text-green-800 mb-2">Betting Result</h5>
            <div className="text-sm text-green-700">
              {(() => {
                const winnerPosition = selectedFight.position?.find(
                  p => p.participantID === formData.winnerParticipantID
                )
                const loserPosition = selectedFight.position?.find(
                  p => p.participantID !== formData.winnerParticipantID
                )

                                                if (winnerPosition && loserPosition) {
                  const totalBet = selectedFight.totalBet || 0
                  const plazadaFee = selectedFight.plazadaFee || 0
                  const houseCut = plazadaFee // House cut equals plazada fee
                  const winnerPayout = totalBet - houseCut // Winner gets total minus house cut only

                  return (
                    <div className="space-y-1">
                      <div>
                        <strong>{winnerPosition.side}</strong> wins!
                      </div>
                      <div className="text-xs space-y-1">
                        <div>Total bet pool: ₱{totalBet.toLocaleString()}</div>
                        <div>House cut: -₱{houseCut.toLocaleString()}</div>
                        <div className="text-muted-foreground">Plazada fee: ₱{plazadaFee.toLocaleString()} (collected separately)</div>
                        <div className="font-semibold border-t pt-1 text-green-700">
                          Winner payout: ₱{winnerPayout.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              })()}
            </div>
          </div>
        )}
      </div>
    </CustomAlertDialog>
  )
}

export default MatchResultForm
