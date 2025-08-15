import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'
import NativeSelect from '@/components/custom/NativeSelect'

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
            {isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Profile' : 'Create Profile')}
          </Button>
        </>
      }
    >
      <div className="space-y-6 overflow-y-auto pr-2">
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

        <div className="space-y-2">
          <Label htmlFor={isEdit ? "editOwnerName" : "ownerName"} className="text-sm font-medium">
            Owner *
          </Label>
          <NativeSelect
            id={isEdit ? "editOwnerName" : "ownerName"}
            value={formData.ownerName}
            onChange={(e) => onInputChange('ownerName', e.target.value)}
            required
          >
            <option value="">Select Owner</option>
            {participants.map((p) => (
              <option key={p._id} value={p.participantName}>
                {p.participantName}
              </option>
            ))}
          </NativeSelect>
        </div>

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
    </CustomAlertDialog>
  )
}

export default CockProfileForm
