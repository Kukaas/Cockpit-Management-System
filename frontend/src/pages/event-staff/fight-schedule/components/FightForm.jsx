import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
  isEdit = false,
  event = null
}) => {
    // Get cock profiles for selected participants
  const getCockProfilesForParticipant = (participantId) => {
    if (!participantId) return []

    // Filter cock profiles by participant ID
    // Backend already filters for available cocks (status: 'available')
    return availableCockProfiles.filter(
      cock => cock.participantID === participantId
    )
  }

  const participant1CockProfiles = getCockProfilesForParticipant(formData.participant1)
  const participant2CockProfiles = getCockProfilesForParticipant(formData.participant2)

  // Helper function to get default scheduled time (event date + current time)
  const getDefaultScheduledTime = () => {
    if (!event || !event.date) return ''

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

  // Set default scheduled time when form opens and no time is set
  React.useEffect(() => {
    if (open && !formData.scheduledTime && event) {
      const defaultTime = getDefaultScheduledTime()
      if (defaultTime) {
        onInputChange('scheduledTime', defaultTime)
      }
    }
  }, [open, formData.scheduledTime, event, onInputChange])

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
                {participant1CockProfiles.length === 0 && formData.participant1 && (
                  <option value="" disabled>
                    No available cocks for this participant
                  </option>
                )}
                {participant1CockProfiles.map((cock) => (
                  <option key={cock._id} value={cock._id}>
                    {event?.eventType === 'derby'
                      ? `${cock.legband || 'N/A'} - ${cock.weight || 'N/A'}kg`
                      : `${cock.entryNo || 'N/A'}`
                    }
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
                {participant2CockProfiles.length === 0 && formData.participant2 && (
                  <option value="" disabled>
                    No available cocks for this participant
                  </option>
                )}
                {participant2CockProfiles.map((cock) => (
                  <option key={cock._id} value={cock._id}>
                    {event?.eventType === 'derby'
                      ? `${cock.legband || 'N/A'} - ${cock.weight || 'N/A'}kg`
                      : `${cock.entryNo || 'N/A'}`
                    }
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
        </div>

        {/* Cock Availability Warning */}
        {(participant1CockProfiles.length === 0 || participant2CockProfiles.length === 0) && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ Cock Availability Warning</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              {participant1CockProfiles.length === 0 && formData.participant1 && (
                <p>• <strong>{availableParticipants.find(p => p._id === formData.participant1)?.participantName}</strong> has no available cocks (all cocks are either scheduled or have already fought)</p>
              )}
              {participant2CockProfiles.length === 0 && formData.participant2 && (
                <p>• <strong>{availableParticipants.find(p => p._id === formData.participant2)?.participantName}</strong> has no available cocks (all cocks are either scheduled or have already fought)</p>
              )}
              <p className="text-xs mt-2">Note: Cocks become unavailable when scheduled for a fight or after participating in a completed fight.</p>
            </div>
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
      </div>
    </CustomAlertDialog>
  )
}

export default FightForm
