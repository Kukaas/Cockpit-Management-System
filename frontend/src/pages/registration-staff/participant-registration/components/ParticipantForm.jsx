import React from 'react'
import { Button } from '@/components/ui/button'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'

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
        </div>
      </div>
    </CustomAlertDialog>
  )
}

export default ParticipantForm
