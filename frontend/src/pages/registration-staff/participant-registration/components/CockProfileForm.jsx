import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'
import { User, Search, Phone } from 'lucide-react'
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
    }
  }, [open])

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
            {isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Profile' : 'Create Profile')}
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
                    className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${
                      selectedParticipantId === participant._id ? 'bg-muted' : ''
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
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                      <span className="text-gray-600">
                        {selectedParticipant.address || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 text-gray-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 6v6l4 2"/>
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
        <div className="space-y-4">
          {/* Entry number is auto-generated - show next available number */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Entry Number</Label>
            <div className="p-3 bg-muted/50 rounded-md border text-sm text-muted-foreground">
              Next available entry number: <span className="font-mono font-semibold text-primary">#{nextEntryNo}</span>
            </div>
          </div>

          {/* Derby Event Fields */}
          {event?.eventType === 'derby' && (
            <>
              <InputField
                id={isEdit ? "editLegband" : "legband"}
                label="Legband *"
                value={formData.legband}
                onChange={(e) => onInputChange('legband', e.target.value)}
                placeholder="Enter legband"
                required
              />
              <InputField
                id={isEdit ? "editWeight" : "weight"}
                label="Weight (kg) *"
                type="number"
                value={formData.weight}
                onChange={(e) => onInputChange('weight', e.target.value)}
                placeholder="Enter weight in kg (e.g., 2.24)"
                min="0.01"
                max="10.0"
                step="0.01"
                required
              />
            </>
          )}

          {isEdit && (
            <InputField
              id="editParticipantID"
              label="Participant ID *"
              value={formData.participantID}
              onChange={(e) => onInputChange('participantID', e.target.value)}
              placeholder="Enter participant ID"
              required
            />
          )}
        </div>
      </div>
    </CustomAlertDialog>
  )
}

export default CockProfileForm
