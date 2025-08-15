import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Search } from 'lucide-react'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'
import { useGetAll } from '@/hooks/useApiQueries'

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

  // Fetch participants for this specific event to find existing owners
  const { data: participantsData = [] } = useGetAll(`/participants?eventID=${eventId}`)
  const participantRecords = participantsData || []

  // Filter participants based on search query
  const filteredParticipants = participantRecords.filter(participant =>
    participant.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    participant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    participant.contactNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle participant selection
  const handleParticipantSelection = (participantId) => {
    setSelectedParticipantId(participantId)
    if (participantId) {
      const selectedParticipant = participantRecords.find(p => p._id === participantId)
      if (selectedParticipant) {
        // Auto-fill form with selected participant's data
        onInputChange('ownerName', selectedParticipant.participantName)
      }
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
                placeholder="Search by name, email, or contact number..."
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
                        <p className="font-medium text-sm">{participant.participantName}</p>
                        <p className="text-xs text-muted-foreground">{participant.email}</p>
                        <p className="text-xs text-muted-foreground">{participant.contactNumber}</p>
                        <p className="text-xs text-muted-foreground">{participant.address}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="default"
                          className="text-xs"
                        >
                          Registered
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Entry Fee: ₱{participant.entryFee}
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
              <div className="bg-green-50 p-3 rounded-md border border-green-200">
                <p className="text-sm text-green-800 mb-2">
                  ✓ Selected registered participant. Owner information auto-filled below.
                </p>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">Selected Owner:</h4>
                    <Badge variant="default" className="text-xs">Registered</Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedParticipant.participantName}</p>
                    <p><span className="font-medium">Email:</span> {selectedParticipant.email}</p>
                    <p><span className="font-medium">Contact:</span> {selectedParticipant.contactNumber}</p>
                    <p><span className="font-medium">Address:</span> {selectedParticipant.address}</p>
                    <p><span className="font-medium">Entry Fee:</span> ₱{selectedParticipant.entryFee}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Cock Profile Information Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id={isEdit ? "editLegband" : "legband"}
              label="Legband *"
              value={formData.legband}
              onChange={(e) => onInputChange('legband', e.target.value)}
              placeholder="Enter legband"
              required
            />
            <InputField
              id={isEdit ? "editEntryNo" : "entryNo"}
              label="Entry Number *"
              value={formData.entryNo}
              onChange={(e) => onInputChange('entryNo', e.target.value)}
              placeholder="Enter entry number"
              required
            />
          </div>

          <InputField
            id={isEdit ? "editOwnerName" : "ownerName"}
            label="Owner *"
            value={formData.ownerName}
            onChange={(e) => onInputChange('ownerName', e.target.value)}
            placeholder="Select owner from search above"
            className="hidden"
            required
            disabled={!isEdit && selectedParticipantId}
            readOnly={!isEdit && selectedParticipantId}
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

          <div className="space-y-2">
            <Label htmlFor={isEdit ? "editCockNotes" : "cockNotes"} className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id={isEdit ? "editCockNotes" : "cockNotes"}
              value={formData.notes}
              onChange={(e) => onInputChange('notes', e.target.value)}
              placeholder="Enter additional notes (optional)"
              rows={3}
            />
          </div>
        </div>
      </div>
    </CustomAlertDialog>
  )
}

export default CockProfileForm
