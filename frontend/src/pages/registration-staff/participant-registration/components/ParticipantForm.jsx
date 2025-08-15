import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Search } from 'lucide-react'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'
import NativeSelect from '@/components/custom/NativeSelect'
import { useGetAll } from '@/hooks/useApiQueries'

const ParticipantForm = ({
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
  const [selectedEntranceId, setSelectedEntranceId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch entrance records for this specific event to find existing people
  const { data: entranceData = [] } = useGetAll(`/entrances?eventID=${eventId}`)
  const entranceRecords = entranceData || []

  // Filter entrance records based on search query
  const filteredEntrances = entranceRecords.filter(entrance =>
    entrance.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entrance.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entrance.contactNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle entrance selection
  const handleEntranceSelection = (entranceId) => {
    setSelectedEntranceId(entranceId)
    if (entranceId) {
      const selectedEntrance = entranceRecords.find(e => e._id === entranceId)
      if (selectedEntrance) {
        // Auto-fill form with selected entrance person's data
        onInputChange('participantName', selectedEntrance.personName)
        onInputChange('contactNumber', selectedEntrance.contactNumber)
        onInputChange('email', selectedEntrance.email)
        onInputChange('address', selectedEntrance.address)
      }
    }
  }

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedEntranceId('')
      setSearchQuery('')
    }
  }, [open])

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
            {isPending ? (isEdit ? 'Updating...' : 'Registering...') : (isEdit ? 'Update Participant' : 'Register Participant')}
          </Button>
        </>
      }
    >
      <div className="space-y-6 overflow-y-auto pr-2">
        {/* Search for Existing Sabungeros with Entrance */}
        {!isEdit && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <Label className="text-sm font-medium">Search Sabungeros with Entrance</Label>
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

            {searchQuery && filteredEntrances.length > 0 && (
              <div className="max-h-48 overflow-y-auto border rounded-md">
                {filteredEntrances.map((entrance) => (
                  <div
                    key={entrance._id}
                    className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${
                      selectedEntranceId === entrance._id ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleEntranceSelection(entrance._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{entrance.personName}</p>
                        <p className="text-xs text-muted-foreground">{entrance.email}</p>
                        <p className="text-xs text-muted-foreground">{entrance.contactNumber}</p>
                        <p className="text-xs text-muted-foreground">{entrance.address}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            entrance.status === 'paid' ? 'default' : 'outline'
                          }
                          className="text-xs"
                        >
                          {entrance.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Entrance Fee: ₱{entrance.entranceFee}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && filteredEntrances.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No entrance records found</p>
                <p className="text-xs">You can still register a new participant below</p>
              </div>
            )}

            {selectedEntranceId && (
              <div className="bg-green-50 p-3 rounded-md border border-green-200">
                <p className="text-sm text-green-800">
                  ✓ Selected existing sabungero from entrance records. Information auto-filled below.
                </p>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Participant Information Form */}
        <div className="space-y-4">
          <InputField
            id={isEdit ? "editParticipantName" : "participantName"}
            label="Participant Name *"
            value={formData.participantName}
            onChange={(e) => onInputChange('participantName', e.target.value)}
            placeholder="Enter participant name"
            required
            disabled={true}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id={isEdit ? "editContactNumber" : "contactNumber"}
              label="Contact Number *"
              value={formData.contactNumber}
              onChange={(e) => onInputChange('contactNumber', e.target.value)}
              placeholder="Enter contact number"
              required
              disabled={true}
            />
            <InputField
              id={isEdit ? "editEmail" : "email"}
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              placeholder="Enter email address"
              required
              disabled={true}
            />
          </div>

          <InputField
            id={isEdit ? "editAddress" : "address"}
            label="Address *"
            value={formData.address}
            onChange={(e) => onInputChange('address', e.target.value)}
            placeholder="Enter address"
            required
            disabled={true}
          />

          {/* Event defaults are shown but not editable */}
          <InputField
            id={isEdit ? "editEntryFee" : "entryFee"}
            label="Entry Fee (PHP) *"
            type="number"
            value={formData.entryFee}
            onChange={() => {}}
            readOnly
            placeholder="Enter entry fee"
            min="0"
            step="0.01"
            required
          />

          <div className="space-y-2">
            <Label htmlFor={isEdit ? "editEventType" : "eventType"} className="text-sm font-medium">
              Event Type *
            </Label>
            <NativeSelect
              id={isEdit ? "editEventType" : "eventType"}
              value={formData.eventType}
              onChange={() => {}}
              disabled
              required
            >
              <option value="regular">Regular</option>
              <option value="special">Special</option>
              <option value="championship">Championship</option>
              <option value="exhibition">Exhibition</option>
            </NativeSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor={isEdit ? "editNotes" : "notes"} className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id={isEdit ? "editNotes" : "notes"}
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

export default ParticipantForm
