import React from 'react'
import { Button } from '@/components/ui/button'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'
import { Hash } from 'lucide-react'

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
            {isPending ? (isEdit ? 'Updating...' : 'Recording...') : (isEdit ? 'Update Tally' : 'Record Tally')}
          </Button>
        </>
      }
    >
      <div className="space-y-6 overflow-y-auto pr-2">
        <InputField
          id={isEdit ? "editCount" : "count"}
          label="Number of Entrances *"
          icon={Hash}
          type="number"
          value={formData.count}
          onChange={(e) => onInputChange('count', e.target.value)}
          placeholder="Enter number of entrances"
          min="1"
          required
        />
      </div>
    </CustomAlertDialog>
  )
}

export default EntranceForm
