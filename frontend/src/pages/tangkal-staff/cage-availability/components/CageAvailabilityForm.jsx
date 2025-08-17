import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Shield, MapPin, Hash, Settings, FileText, Plus, Minus } from 'lucide-react'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'
import NativeSelect from '@/components/custom/NativeSelect'

const CageAvailabilityForm = ({
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
  const arenaOptions = [
    'Buenavista Cockpit Arena',
    'Mogpog Cockpit Arena',
    'Boac Cockpit Arena'
  ]

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'rented', label: 'Rented' }
  ]

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
            {isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Cage' : 'Create Cages')}
          </Button>
        </>
      }
    >
      <div className="space-y-6 overflow-y-auto pr-2">
        {/* Cage Information Form */}
        <div className="space-y-4">
          {!isEdit && (
            <>
              <div className="space-y-2">
                <Label htmlFor="bulkCount" className="text-sm font-medium">
                  Number of Cages to Create *
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentCount = parseInt(formData.bulkCount) || 1
                      if (currentCount > 1) {
                        onInputChange('bulkCount', (currentCount - 1).toString())
                      }
                    }}
                    disabled={parseInt(formData.bulkCount) <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <InputField
                    id="bulkCount"
                    type="number"
                    value={formData.bulkCount}
                    onChange={(e) => onInputChange('bulkCount', e.target.value)}
                    placeholder="Enter number of cages"
                    min="1"
                    max="100"
                    required
                    className="w-full"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentCount = parseInt(formData.bulkCount) || 1
                      if (currentCount < 100) {
                        onInputChange('bulkCount', (currentCount + 1).toString())
                      }
                    }}
                    disabled={parseInt(formData.bulkCount) >= 100}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  You can create up to 100 cages at once. Cage numbers will be auto-generated.
                </p>
              </div>
            </>
          )}

          {isEdit && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                id="editCageNumber"
                label="Cage Number *"
                value={formData.cageNumber}
                onChange={(e) => onInputChange('cageNumber', e.target.value)}
                placeholder="Enter cage number (e.g., C001)"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor={isEdit ? "editArena" : "arena"} className="text-sm font-medium">
              Arena *
            </Label>
            <NativeSelect
              id={isEdit ? "editArena" : "arena"}
              value={formData.arena}
              onChange={(e) => onInputChange('arena', e.target.value)}
              required
            >
              {arenaOptions.map((arena) => (
                <option key={arena} value={arena}>
                  {arena}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor={isEdit ? "editStatus" : "status"} className="text-sm font-medium">
              Status *
            </Label>
            <NativeSelect
              id={isEdit ? "editStatus" : "status"}
              value={formData.status}
              onChange={(e) => onInputChange('status', e.target.value)}
              required
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>
      </div>
    </CustomAlertDialog>
  )
}

export default CageAvailabilityForm
