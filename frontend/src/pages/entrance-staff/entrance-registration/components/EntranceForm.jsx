import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'

const EntranceForm = ({
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
            {isPending ? (isEdit ? 'Updating...' : 'Recording...') : (isEdit ? 'Update Record' : 'Record Entrance')}
          </Button>
        </>
      }
    >
      <div className="space-y-6 overflow-y-auto pr-2">
        <InputField
          id={isEdit ? "editPersonName" : "personName"}
          label="Person Name *"
          value={formData.personName}
          onChange={(e) => onInputChange('personName', e.target.value)}
          placeholder="Enter person's full name"
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

        {/* Entrance fee is shown but not editable */}
        <InputField
          id={isEdit ? "editEntranceFee" : "entranceFee"}
          label="Entrance Fee (PHP) *"
          type="number"
          value={formData.entranceFee}
          onChange={() => {}}
          readOnly
          placeholder="Enter entrance fee"
          min="0"
          step="0.01"
          required
        />

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

export default EntranceForm
