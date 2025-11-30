import React from 'react'
import { Button } from '@/components/ui/button'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'
import { } from 'lucide-react'

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
  event = null
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
        {/* Participant Information Form */}
        <div className="space-y-4">
          <InputField
            id={isEdit ? "editParticipantName" : "participantName"}
            label="Participant Name *"
            value={formData.participantName}
            onChange={(e) => onInputChange('participantName', e.target.value)}
            placeholder="Enter participant name"
            required
          />

          <InputField
            id={isEdit ? "editContactNumber" : "contactNumber"}
            label="Contact Number *"
            value={formData.contactNumber}
            onChange={(e) => onInputChange('contactNumber', e.target.value)}
            placeholder="Enter contact number"
            required
          />

          <InputField
            id={isEdit ? "editAddress" : "address"}
            label="Address *"
            value={formData.address}
            onChange={(e) => onInputChange('address', e.target.value)}
            placeholder="Enter address"
            required
          />

          {/* Entry Fee - Required if event has entryFee (Read-only) */}
          {event?.entryFee && event.entryFee > 0 && (
            <InputField
              id={isEdit ? "editEntryFee" : "entryFee"}
              label={`Entry Fee (PHP) *`}
              type="number"
              value={formData.entryFee || event.entryFee.toString()}
              onChange={(e) => onInputChange('entryFee', e.target.value)}
              placeholder={`Entry fee: ${event.entryFee} PHP`}
              min="0"
              step="0.01"
              required
              disabled
              className="bg-muted cursor-not-allowed"
            />
          )}
        </div>
      </div>
    </CustomAlertDialog>
  )
}

export default ParticipantForm
