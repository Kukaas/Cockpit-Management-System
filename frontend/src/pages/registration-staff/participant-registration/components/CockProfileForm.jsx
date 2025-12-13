import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'
import { User, Search, Phone, Plus, Trash2 } from 'lucide-react'
import { useGetAll, useGetById } from '@/hooks/useApiQueries'

const CockProfileForm = ({
  open,
  onOpenChange,
  title,
  description,
  formData,
  onInputChange,
  onSubmit,
  onCancel,
  isPending,
  isEdit = false,
  eventId
}) => {
  const [selectedParticipantId, setSelectedParticipantId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [cockProfiles, setCockProfiles] = useState([{ legbandNumber: '', weight: '' }])

  // Fetch event details to check event type
  const { data: event } = useGetById('/events', eventId)

  // Fetch participants for this specific event
  const { data: participantsData = [] } = useGetAll(`/participants?eventID=${eventId}`)
  const participantRecords = participantsData || []

  // Fetch existing cock profiles to determine next entry number
  const { data: cockProfilesData = [] } = useGetAll(`/cock-profiles?eventID=${eventId}`)
  const existingCockProfiles = cockProfilesData || []

  // Calculate next entry number
  const nextEntryNo = existingCockProfiles.length > 0
    ? Math.max(...existingCockProfiles.map(cp => cp.entryNo)) + 1
    : 1

  // Filter participants based on search query
  const filteredParticipants = participantRecords.filter(participant =>
    (participant.participantName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (participant.contactNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  )

  // Handle participant selection
  const handleParticipantSelection = (participantId) => {
    setSelectedParticipantId(participantId)
    if (participantId) {
      onInputChange('participantID', participantId)
    }
  }

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedParticipantId('')
      setSearchQuery('')
      if (!isEdit) {
        setCockProfiles([{ legbandNumber: '', weight: '' }])
      }
    }
  }, [open, isEdit])

  // Update formData when cockProfiles changes (for non-edit mode)
  useEffect(() => {
    if (!isEdit && open) {
      onInputChange('cockProfiles', cockProfiles)
    }
  }, [cockProfiles, isEdit, open])

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

  // Get selected participant data for preview
  const selectedParticipant = participantRecords.find(p => p._id === selectedParticipantId)

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
            {isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Profile' : `Create ${cockProfiles.length} Profile${cockProfiles.length > 1 ? 's' : ''}`)}
          </Button>
        </>
      }
    >
      <div className="space-y-6 overflow-y-auto pr-2">
        {/* Search for Registered Participants */}
        {!isEdit && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <Label className="text-sm font-medium">Search Registered Participants</Label>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or contact number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md text-sm"
              />
            </div>

            {searchQuery && filteredParticipants.length > 0 && (
              <div className="max-h-48 overflow-y-auto border rounded-md">
                {filteredParticipants.map((participant) => (
                  <div
                    key={participant._id}
                    className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${selectedParticipantId === participant._id ? 'bg-muted' : ''
                      }`}
                    onClick={() => handleParticipantSelection(participant._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{participant.participantName || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{participant.contactNumber || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{participant.address || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Status: {participant.status || 'registered'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && filteredParticipants.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No registered participants found</p>
                <p className="text-xs">Please register a participant first before creating a cock profile</p>
              </div>
            )}

            {selectedParticipantId && selectedParticipant && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-medium text-green-800">
                    ✓ Participant Selected Successfully
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-green-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-base">
                        {selectedParticipant.participantName || 'N/A'}
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {selectedParticipant.contactNumber || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 mt-0.5 text-gray-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <span className="text-gray-600">
                        {selectedParticipant.address || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 text-gray-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                      </div>
                      <span className="text-gray-600">
                        Status: <span className="font-medium capitalize">{selectedParticipant.status || 'registered'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cock Profile Information Form */}
        {!isEdit && selectedParticipantId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Cock Profiles</Label>
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

                {/* Entry number is auto-generated - show next available number */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Entry Number</Label>
                  <div className="p-3 bg-muted/50 rounded-md border text-sm text-muted-foreground">
                    Next available entry number: <span className="font-mono font-semibold text-primary">#{nextEntryNo + index}</span>
                  </div>
                </div>

                {/* Derby and Hits Ulutan Event Fields */}
                {(event?.eventType === 'derby' || event?.eventType === 'hits_ulutan') && (
                  <>
                    <InputField
                      id={`legbandNumber-${index}`}
                      label="Legband Number *"
                      type="text"
                      value={profile.legbandNumber}
                      onChange={(e) => {
                        // Only allow numeric input, max 3 digits
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value.length <= 3) {
                          handleCockProfileInputChange(index, 'legbandNumber', value);
                        }
                      }}
                      placeholder="e.g., 001"
                      maxLength={3}
                      pattern="[0-9]{3}"
                      required
                      helperText="Exactly 3 digits (001-999)"
                    />
                    {/* Weight only required for derby events, not hits_ulutan */}
                    {event?.eventType === 'derby' && (
                      <div className="space-y-2">
                        <InputField
                          id={`weight-${index}`}
                          label="Weight (grams) *"
                          type="number"
                          value={profile.weight}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Prevent input if value exceeds maxWeight
                            if (event?.maxWeight && value && Number(value) > event.maxWeight) {
                              // Don't update if exceeds max
                              return;
                            }
                            handleCockProfileInputChange(index, 'weight', value);
                          }}
                          placeholder="Enter weight in grams (e.g., 2500)"
                          min="10"
                          max={event?.maxWeight || "10000"}
                          step="1"
                          required
                          helperText={event?.minWeight && event?.maxWeight ?
                            `Acceptable range: ${event.minWeight}-${event.maxWeight}g` :
                            event?.desiredWeight ?
                              `Minimum weight: ${event.desiredWeight}g` :
                              "Weight in grams"
                          }
                        />
                        {/* Weight validation warning */}
                        {profile.weight && event?.minWeight && event?.maxWeight && (
                          Number(profile.weight) < event.minWeight || Number(profile.weight) > event.maxWeight
                        ) && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-xs text-red-800">
                                ❌ Error: Weight must be between {event.minWeight}g and {event.maxWeight}g (entered: {profile.weight}g). This entry cannot be saved until the weight is within the acceptable range.
                              </p>
                            </div>
                          )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Edit mode - single cock profile */}
        {isEdit && (
          <div className="space-y-4">
            {/* Entry number is auto-generated - show next available number */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Entry Number</Label>
              <div className="p-3 bg-muted/50 rounded-md border text-sm text-muted-foreground">
                Entry number: <span className="font-mono font-semibold text-primary">#{formData.entryNo || nextEntryNo}</span>
              </div>
            </div>

            {/* Derby and Hits Ulutan Event Fields */}
            {(event?.eventType === 'derby' || event?.eventType === 'hits_ulutan') && (
              <>
                <InputField
                  id="editLegbandNumber"
                  label="Legband Number *"
                  type="text"
                  value={formData.legbandNumber}
                  onChange={(e) => {
                    // Only allow numeric input, max 3 digits
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length <= 3) {
                      onInputChange('legbandNumber', value);
                    }
                  }}
                  placeholder="e.g., 001"
                  maxLength={3}
                  pattern="[0-9]{3}"
                  required
                  helperText="Exactly 3 digits (001-999)"
                />
                {/* Weight only required for derby events, not hits_ulutan */}
                {event?.eventType === 'derby' && (
                  <div className="space-y-2">
                    <InputField
                      id="editWeight"
                      label="Weight (grams) *"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Prevent input if value exceeds maxWeight
                        if (event?.maxWeight && value && Number(value) > event.maxWeight) {
                          // Don't update if exceeds max
                          return;
                        }
                        onInputChange('weight', value);
                      }}
                      placeholder="Enter weight in grams (e.g., 2500)"
                      min="10"
                      max={event?.maxWeight || "10000"}
                      step="1"
                      required
                      helperText={event?.minWeight && event?.maxWeight ?
                        `Acceptable range: ${event.minWeight}-${event.maxWeight}g` :
                        event?.desiredWeight ?
                          `Minimum weight: ${event.desiredWeight}g` :
                          "Weight in grams"
                      }
                    />
                    {/* Weight validation warning */}
                    {formData.weight && event?.minWeight && event?.maxWeight && (
                      Number(formData.weight) < event.minWeight || Number(formData.weight) > event.maxWeight
                    ) && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-xs text-red-800">
                            ❌ Error: Weight must be between {event.minWeight}g and {event.maxWeight}g (entered: {formData.weight}g). This entry cannot be saved until the weight is within the acceptable range.
                          </p>
                        </div>
                      )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </CustomAlertDialog>
  )
}

export default CockProfileForm
