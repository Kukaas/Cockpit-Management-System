import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Shield, MapPin, Hash, Settings, FileText } from 'lucide-react'
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
            {isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Cage' : 'Create Cage')}
          </Button>
        </>
      }
    >
      <div className="space-y-6 overflow-y-auto pr-2">
        {/* Cage Information Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id={isEdit ? "editCageNumber" : "cageNumber"}
              label="Cage Number *"
              value={formData.cageNumber}
              onChange={(e) => onInputChange('cageNumber', e.target.value)}
              placeholder="Enter cage number (e.g., C001)"
              required
            />
            <InputField
              id={isEdit ? "editAvailabilityNumber" : "availabilityNumber"}
              label="Availability Number"
              type="number"
              value={formData.availabilityNumber}
              onChange={() => {}}
              placeholder="Auto-generated"
              min="1"
              disabled
              readOnly
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Cage numbers must be unique within each arena. The same cage number can be used in different arenas.
            </p>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor={isEdit ? "editDescription" : "description"} className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id={isEdit ? "editDescription" : "description"}
              value={formData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              placeholder="Enter cage description (optional)"
              rows={3}
            />
          </div>
        </div>

        {/* Status Information */}
        <Separator />
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Status Information</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-700">Active - Available for rental</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-md">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs text-red-700">Inactive - Not available</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-md">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-xs text-yellow-700">Maintenance - Under repair</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-blue-700">Rented - Currently occupied</span>
            </div>
          </div>
        </div>
      </div>
    </CustomAlertDialog>
  )
}

export default CageAvailabilityForm
