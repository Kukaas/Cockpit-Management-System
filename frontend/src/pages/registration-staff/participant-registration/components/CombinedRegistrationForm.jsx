import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'
import { Plus, Trash2, DollarSign } from 'lucide-react'
import { useGetById, useGetAll } from '@/hooks/useApiQueries'

const CombinedRegistrationForm = ({
  open,
  onOpenChange,
  title,
  description,
  formData,
  onInputChange,
  onSubmit,
  onCancel,
  isPending,
  eventId,
  isEdit = false,
  participantData = null, // For edit mode - the participant being edited
  event = null // Pass event as prop to avoid duplicate fetching
}) => {
  const [cockProfiles, setCockProfiles] = useState([{ legbandNumber: '', weight: '' }])
  const entryFeeSetRef = useRef(false)

  // Fetch event details to check event type (fallback if not passed as prop)
  const { data: fetchedEvent } = useGetById('/events', eventId, {
    enabled: !!eventId && !event
  })

  // Use passed event prop if available, otherwise use fetched event
  const eventData = event || fetchedEvent

  // Fetch existing cock profiles to determine next entry number
  const { data: cockProfilesData = [] } = useGetAll(
    eventId ? `/cock-profiles?eventID=${eventId}` : null,
    { enabled: !!eventId }
  )
  const existingCockProfiles = cockProfilesData || []

  // Fetch participant's cock profiles for edit mode
  const { data: participantCockProfilesData = [] } = useGetAll(
    isEdit && participantData?._id && eventId
      ? `/cock-profiles?eventID=${eventId}&participantID=${participantData._id}`
      : null,
    { enabled: !!(isEdit && participantData?._id && eventId) }
  )
  const participantCockProfiles = participantCockProfilesData || []

  // Calculate next entry number
  const nextEntryNo = existingCockProfiles.length > 0
    ? Math.max(...existingCockProfiles.map(cp => cp.entryNo)) + 1
    : 1

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      // Reset the ref when dialog opens
      entryFeeSetRef.current = false

      if (isEdit && participantData && participantCockProfiles.length > 0) {
        // Load existing cock profiles for edit mode
        const existingProfiles = participantCockProfiles.map(cp => ({
          legbandNumber: cp.legband || '',
          weight: cp.weight?.toString() || '',
          _id: cp._id, // Keep the ID for updating
          entryNo: cp.entryNo
        }))
        setCockProfiles(existingProfiles)
      } else {
        setCockProfiles([{ legbandNumber: '', weight: '' }])
      }
    } else {
      // Reset ref when dialog closes
      entryFeeSetRef.current = false
    }
  }, [open, isEdit, participantData, participantCockProfiles.length])

  // Set default entryFee from event if available (separate effect to avoid infinite loop)
  useEffect(() => {
    if (open && !isEdit && eventData?.entryFee && eventData.entryFee > 0 && !entryFeeSetRef.current) {
      const entryFeeValue = eventData.entryFee.toString()
      // Only set if the current value is different
      if (formData.entryFee !== entryFeeValue) {
        onInputChange('entryFee', entryFeeValue)
        entryFeeSetRef.current = true
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit, eventData?.entryFee])

  // Update formData when cockProfiles changes
  useEffect(() => {
    if (open) {
      onInputChange('cockProfiles', cockProfiles)
    }
  }, [cockProfiles, open])

  // Handle adding a new cock profile entry
  const handleAddCockProfile = () => {
    setCockProfiles([...cockProfiles, { legbandNumber: '', weight: '' }])
  }

  // Handle removing a cock profile entry
  const handleRemoveCockProfile = (index) => {
    if (cockProfiles.length > 1) {
      const newProfiles = cockProfiles.filter((_, i) => i !== index)
      setCockProfiles(newProfiles)
    }
  }

  // Handle input change for a specific cock profile
  const handleCockProfileInputChange = (index, field, value) => {
    const newProfiles = [...cockProfiles]
    newProfiles[index] = { ...newProfiles[index], [field]: value }
    setCockProfiles(newProfiles)
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
            {isPending
              ? (isEdit ? 'Updating...' : 'Registering...')
              : (isEdit
                ? `Update Participant${cockProfiles.length > 1 ? ` & ${cockProfiles.length} Cocks` : ' & Cock'}`
                : `Register Participant${cockProfiles.length > 1 ? ` & ${cockProfiles.length} Cocks` : ' & Cock'}`
              )
            }
          </Button>
        </>
      }
    >
      <div className="space-y-6 overflow-y-auto pr-2">
        {/* Participant Information Form */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-base font-semibold">Participant Information</Label>
          </div>

          <InputField
            id="participantName"
            label="Participant Name *"
            value={formData.participantName}
            onChange={(e) => onInputChange('participantName', e.target.value)}
            placeholder="Enter participant name"
            required
          />

          <InputField
            id="contactNumber"
            label="Contact Number *"
            value={formData.contactNumber}
            onChange={(e) => onInputChange('contactNumber', e.target.value)}
            placeholder="Enter contact number"
            required
          />

          <InputField
            id="address"
            label="Address *"
            value={formData.address}
            onChange={(e) => onInputChange('address', e.target.value)}
            placeholder="Enter address"
            required
          />

          {/* Entry Fee - Required if event has entryFee (Read-only) */}
          {eventData?.entryFee && eventData.entryFee > 0 && (
            <InputField
              id="entryFee"
              label={`Entry Fee (PHP) *`}
              icon={DollarSign}
              type="number"
              value={formData.entryFee || eventData.entryFee.toString()}
              onChange={(e) => onInputChange('entryFee', e.target.value)}
              placeholder={`Entry fee: ${eventData.entryFee} PHP`}
              min="0"
              step="0.01"
              required
              disabled
              className="bg-muted cursor-not-allowed"
            />
          )}
        </div>

        {/* Cock Profile Information Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-base font-semibold">Cock Profiles</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCockProfile}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Another
            </Button>
          </div>

          {cockProfiles.map((profile, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Cock Profile {index + 1}</Label>
                {cockProfiles.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCockProfile(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Entry number - show existing or next available */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Entry Number</Label>
                <div className="p-3 bg-muted/50 rounded-md border text-sm text-muted-foreground">
                  {isEdit && profile.entryNo ? (
                    <>Entry number: <span className="font-mono font-semibold text-primary">#{profile.entryNo}</span></>
                  ) : (
                    <>Next available entry number: <span className="font-mono font-semibold text-primary">#{nextEntryNo + index}</span></>
                  )}
                </div>
              </div>

              {/* Derby and Hits Ulutan Event Fields */}
              {(eventData?.eventType === 'derby' || eventData?.eventType === 'hits_ulutan') && (
                <>
                  <InputField
                    id={`legbandNumber-${index}`}
                    label="Legband Number *"
                    value={profile.legbandNumber}
                    onChange={(e) => handleCockProfileInputChange(index, 'legbandNumber', e.target.value)}
                    placeholder="Enter legband number"
                    required
                  />
                  {/* Weight only required for derby events, not hits_ulutan */}
                  {eventData?.eventType === 'derby' && (
                    <InputField
                      id={`weight-${index}`}
                      label="Weight (grams) *"
                      type="number"
                      value={profile.weight}
                      onChange={(e) => handleCockProfileInputChange(index, 'weight', e.target.value)}
                      placeholder="Enter weight in grams (e.g., 2240)"
                      min="10"
                      max="10000"
                      step="1"
                      required
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </CustomAlertDialog>
  )
}

export default CombinedRegistrationForm

