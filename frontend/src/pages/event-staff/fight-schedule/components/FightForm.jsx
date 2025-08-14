import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'
import NativeSelect from '@/components/custom/NativeSelect'

const FightForm = ({
  open,
  onOpenChange,
  title,
  description,
  formData,
  onInputChange,
  onSubmit,
  onCancel,
  isPending,
  availableParticipants = [],
  availableCockProfiles = [],
  isEdit = false
}) => {
    // Get cock profiles for selected participants
  const getCockProfilesForParticipant = (participantId) => {
    const participant = availableParticipants.find(p => p._id === participantId)
    if (!participant) return []

    // Filter cock profiles by owner name matching the participant's name
    return availableCockProfiles.filter(
      cock => cock.ownerName === participant.participantName && cock.isActive
    )
  }

  const participant1CockProfiles = getCockProfilesForParticipant(formData.participant1)
  const participant2CockProfiles = getCockProfilesForParticipant(formData.participant2)

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
            {isPending ? (isEdit ? 'Updating...' : 'Scheduling...') : (isEdit ? 'Update Fight' : 'Schedule Fight')}
          </Button>
        </>
      }
    >
      <div className="space-y-6 overflow-y-auto pr-2">

        {/* Participant Selection */}
        <div className="space-y-4">
          <h4 className="font-medium">Participants</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={isEdit ? "editParticipant1" : "participant1"} className="text-sm font-medium">
                Participant 1 *
              </Label>
              <NativeSelect
                id={isEdit ? "editParticipant1" : "participant1"}
                value={formData.participant1}
                onChange={(e) => {
                  onInputChange('participant1', e.target.value)
                  // Reset cock profile when participant changes
                  onInputChange('cockProfile1', '')
                }}
                required
                disabled={isEdit}
              >
                <option value="">Select Participant 1</option>
                {availableParticipants.map((participant) => (
                  <option
                    key={participant._id}
                    value={participant._id}
                    disabled={participant._id === formData.participant2}
                  >
                    {participant.participantName}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-2">
              <Label htmlFor={isEdit ? "editParticipant2" : "participant2"} className="text-sm font-medium">
                Participant 2 *
              </Label>
              <NativeSelect
                id={isEdit ? "editParticipant2" : "participant2"}
                value={formData.participant2}
                onChange={(e) => {
                  onInputChange('participant2', e.target.value)
                  // Reset cock profile when participant changes
                  onInputChange('cockProfile2', '')
                }}
                required
                disabled={isEdit}
              >
                <option value="">Select Participant 2</option>
                {availableParticipants.map((participant) => (
                  <option
                    key={participant._id}
                    value={participant._id}
                    disabled={participant._id === formData.participant1}
                  >
                    {participant.participantName}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
        </div>

        {/* Cock Profile Selection */}
        <div className="space-y-4">
          <h4 className="font-medium">Cock Profiles</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={isEdit ? "editCockProfile1" : "cockProfile1"} className="text-sm font-medium">
                Cock Profile 1 *
              </Label>
              <NativeSelect
                id={isEdit ? "editCockProfile1" : "cockProfile1"}
                value={formData.cockProfile1}
                onChange={(e) => onInputChange('cockProfile1', e.target.value)}
                required
                disabled={isEdit || !formData.participant1}
              >
                <option value="">
                  {formData.participant1
                    ? `Select Cock Profile 1 (${participant1CockProfiles.length} available)`
                    : "Select Participant 1 first"
                  }
                </option>
                {participant1CockProfiles.map((cock) => (
                  <option key={cock._id} value={cock._id}>
                    {cock.legband} - {cock.weight}kg - Entry: {cock.entryNo}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-2">
              <Label htmlFor={isEdit ? "editCockProfile2" : "cockProfile2"} className="text-sm font-medium">
                Cock Profile 2 *
              </Label>
              <NativeSelect
                id={isEdit ? "editCockProfile2" : "cockProfile2"}
                value={formData.cockProfile2}
                onChange={(e) => onInputChange('cockProfile2', e.target.value)}
                required
                disabled={isEdit || !formData.participant2}
              >
                <option value="">
                  {formData.participant2
                    ? `Select Cock Profile 2 (${participant2CockProfiles.length} available)`
                    : "Select Participant 2 first"
                  }
                </option>
                {participant2CockProfiles.map((cock) => (
                  <option key={cock._id} value={cock._id}>
                    {cock.legband} - {cock.weight}kg - Entry: {cock.entryNo}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
        </div>

        {/* Entry Numbers Display (Auto-filled from Cock Profiles) */}
        {(formData.cockProfile1 || formData.cockProfile2) && (
          <div className="space-y-4">
            <h4 className="font-medium">Entry Numbers</h4>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Entry numbers are automatically taken from selected cock profiles:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Entry 1: </span>
                  <span className="text-blue-600">
                    {formData.cockProfile1
                      ? availableCockProfiles.find(c => c._id === formData.cockProfile1)?.entryNo || 'N/A'
                      : 'Select cock profile first'
                    }
                  </span>
                </div>
                <div>
                  <span className="font-medium">Entry 2: </span>
                  <span className="text-blue-600">
                    {formData.cockProfile2
                      ? availableCockProfiles.find(c => c._id === formData.cockProfile2)?.entryNo || 'N/A'
                      : 'Select cock profile first'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

                        {/* Bet Amounts */}
        <div className="space-y-4">
          <h4 className="font-medium">Betting System</h4>
          <p className="text-sm text-gray-600">Select the base bettor and enter the base bet amount. The selected participant becomes MERON (base + 10% plazada), the other becomes WALA (base amount only).</p>

          {/* Base Bettor Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Base Bettor (Meron) *</Label>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.baseBettor === 'participant1'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  onInputChange('baseBettor', 'participant1')
                  // Recalculate amounts if base bet exists
                  if (formData.baseBetAmount) {
                    const baseBet = parseFloat(formData.baseBetAmount)
                    const plazadaFee = baseBet * 0.10
                    onInputChange('betAmount1', (baseBet + plazadaFee).toString()) // P1 gets base + plazada (Meron)
                    onInputChange('betAmount2', formData.baseBetAmount) // P2 gets base (Wala)
                  }
                }}
              >
                <div className="text-center">
                  <div className="font-medium">Participant 1</div>
                  <div className="text-sm text-gray-500">
                    {availableParticipants.find(p => p._id === formData.participant1)?.participantName || 'Select participant first'}
                  </div>
                </div>
              </div>

              <div
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.baseBettor === 'participant2'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  onInputChange('baseBettor', 'participant2')
                  // Recalculate amounts if base bet exists
                  if (formData.baseBetAmount) {
                    const baseBet = parseFloat(formData.baseBetAmount)
                    const plazadaFee = baseBet * 0.10
                    onInputChange('betAmount2', (baseBet + plazadaFee).toString()) // P2 gets base + plazada (Meron)
                    onInputChange('betAmount1', formData.baseBetAmount) // P1 gets base (Wala)
                  }
                }}
              >
                <div className="text-center">
                  <div className="font-medium">Participant 2</div>
                  <div className="text-sm text-gray-500">
                    {availableParticipants.find(p => p._id === formData.participant2)?.participantName || 'Select participant first'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Base Bet Amount */}
          <div className="space-y-2">
            <InputField
              id={isEdit ? "editBaseBetAmount" : "baseBetAmount"}
              label="Base Bet Amount (PHP) *"
              type="number"
              value={formData.baseBetAmount}
              onChange={(e) => {
                const baseBet = parseFloat(e.target.value) || 0
                onInputChange('baseBetAmount', e.target.value)

                                if (baseBet > 0 && formData.baseBettor) {
                  const plazadaFee = baseBet * 0.10
                  const totalWithPlazada = baseBet + plazadaFee

                  if (formData.baseBettor === 'participant1') {
                    onInputChange('betAmount1', totalWithPlazada.toString()) // P1 gets base + plazada (Meron)
                    onInputChange('betAmount2', e.target.value) // P2 gets base (Wala)
                  } else {
                    onInputChange('betAmount2', totalWithPlazada.toString()) // P2 gets base + plazada (Meron)
                    onInputChange('betAmount1', e.target.value) // P1 gets base (Wala)
                  }
                } else {
                  onInputChange('betAmount1', '')
                  onInputChange('betAmount2', '')
                }
              }}
              placeholder="Enter base bet amount"
              min="100"
              step="100"
              required
              disabled={!formData.baseBettor}
            />
            {!formData.baseBettor && (
              <p className="text-xs text-yellow-600">Please select a base bettor first</p>
            )}
          </div>
        </div>

                        {/* Betting Info Display */}
        {formData.betAmount1 && formData.betAmount2 && formData.baseBettor && (
          <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h5 className="font-medium text-sm text-green-800">Betting Breakdown</h5>

            {(() => {
              const bet1 = parseFloat(formData.betAmount1) || 0
              const bet2 = parseFloat(formData.betAmount2) || 0
              const baseBetAmount = parseFloat(formData.baseBetAmount) || 0
              const plazadaFee = baseBetAmount * 0.10
              const totalBet = bet1 + bet2

              const isParticipant1Wala = formData.baseBettor === 'participant1'
              const participant1Name = availableParticipants.find(p => p._id === formData.participant1)?.participantName || 'Participant 1'
              const participant2Name = availableParticipants.find(p => p._id === formData.participant2)?.participantName || 'Participant 2'

              return (
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="font-medium text-green-700">
                        {participant1Name} {isParticipant1Wala ? '(Wala - Base Bettor)' : '(Meron - Higher Bet)'}
                      </div>
                      <div>Amount: ₱{bet1.toLocaleString()}</div>
                      <div className="text-xs text-blue-600">
                        {isParticipant1Wala ? 'Base bet amount' : 'Base + 10% plazada'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="font-medium text-green-700">
                        {participant2Name} {!isParticipant1Wala ? '(Wala - Base Bettor)' : '(Meron - Higher Bet)'}
                      </div>
                      <div>Amount: ₱{bet2.toLocaleString()}</div>
                      <div className="text-xs text-red-600">
                        {!isParticipant1Wala ? 'Base bet amount' : 'Base + 10% plazada'}
                      </div>
                    </div>
                  </div>

                  {/* Calculation breakdown */}
                  <div className="border-t pt-2 mt-2">
                    <div className="font-medium text-green-800 mb-1">Calculation:</div>
                    <div className="space-y-1 text-xs">
                      <div>Base Bet Amount: ₱{baseBetAmount.toLocaleString()}</div>
                      <div>Plazada Fee (10%): ₱{plazadaFee.toLocaleString()}</div>
                      <div>Meron Amount: ₱{(baseBetAmount + plazadaFee).toLocaleString()} (Base + Plazada)</div>
                    </div>
                  </div>

                  {/* Total fight value */}
                  <div className="border-t pt-2 mt-2 font-medium text-green-800">
                    <div>Total Fight Value: ₱{totalBet.toLocaleString()}</div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Schedule Time */}
        <InputField
          id={isEdit ? "editScheduledTime" : "scheduledTime"}
          label="Scheduled Time"
          type="datetime-local"
          value={formData.scheduledTime}
          onChange={(e) => onInputChange('scheduledTime', e.target.value)}
        />

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "editFightNotes" : "fightNotes"} className="text-sm font-medium">
            Notes
          </Label>
          <Textarea
            id={isEdit ? "editFightNotes" : "fightNotes"}
            value={formData.notes}
            onChange={(e) => onInputChange('notes', e.target.value)}
            placeholder="Enter additional notes (optional)"
            rows={3}
          />
        </div>
      </div>
    </CustomAlertDialog>
  )
}

export default FightForm
