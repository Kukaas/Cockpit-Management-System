import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'
import NativeSelect from '@/components/custom/NativeSelect'

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
  participants = [],
  isEdit = false
}) => {
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
        <InputField
          id={isEdit ? "editParticipantName" : "participantName"}
          label="Participant Name *"
          value={formData.participantName}
          onChange={(e) => onInputChange('participantName', e.target.value)}
          placeholder="Enter participant name"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            id={isEdit ? "editContactNumber" : "contactNumber"}
            label="Contact Number *"
            value={formData.contactNumber}
            onChange={(e) => onInputChange('contactNumber', e.target.value)}
            placeholder="Enter contact number"
            required
          />
          <InputField
            id={isEdit ? "editEmail" : "email"}
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder="Enter email address"
            required
          />
        </div>

        <InputField
          id={isEdit ? "editAddress" : "address"}
          label="Address *"
          value={formData.address}
          onChange={(e) => onInputChange('address', e.target.value)}
          placeholder="Enter address"
          required
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            id={isEdit ? "editMatchWinRequirements" : "matchWinRequirements"}
            label="Match Win Requirements *"
            type="number"
            value={formData.matchWinRequirements}
            onChange={() => {}}
            readOnly
            placeholder="Enter win requirements"
            min="1"
            max="10"
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
    </CustomAlertDialog>
  )
}

export default ParticipantForm
