import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'
import NativeSelect from '@/components/custom/NativeSelect'
import { Calendar, MapPin, DollarSign, Hash, Clock, Users, FileText, Building } from 'lucide-react'

const EventForm = ({
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
  // Check if this is a regular event (simplified form)
  const isRegularEvent = formData.eventType === 'regular'
  const isDerbyEvent = formData.eventType === 'derby'
  const isHitsUlutanEvent = formData.eventType === 'hits_ulutan'
  const isFastestKillEvent = formData.eventType === 'fastest_kill'

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
            {isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Event' : 'Create Event')}
          </Button>
        </>
      }
    >
      <div className="space-y-6 overflow-y-auto pr-2">
        {/* Event Type - This should come early to determine other fields */}
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "editEventType" : "eventType"} className="text-sm font-medium">
            Event Type *
          </Label>
          <NativeSelect
            id={isEdit ? "editEventType" : "eventType"}
            value={formData.eventType}
            onChange={(e) => onInputChange('eventType', e.target.value)}
            placeholder="Select event type"
            required
          >
            <option value="">Select event type...</option>
            <option value="regular">Regular</option>
            <option value="derby">Derby</option>
            <option value="hits_ulutan">Hits Ulutan</option>
            <option value="fastest_kill">Fastest Kill</option>
          </NativeSelect>
        </div>

        {/* Event Name */}
        <InputField
          id={isEdit ? "editEventName" : "eventName"}
          label="Event Name *"
          icon={FileText}
          value={formData.eventName}
          onChange={(e) => onInputChange('eventName', e.target.value)}
          placeholder="Enter event name"
          required
        />

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "editLocation" : "location"} className="text-sm font-medium">
            Location *
          </Label>
          <NativeSelect
            id={isEdit ? "editLocation" : "location"}
            value={formData.location}
            onChange={(e) => onInputChange('location', e.target.value)}
            placeholder="Select event location"
            required
          >
            <option value="">Select location...</option>
            <option value="Buenavista Cockpit Arena">Buenavista Cockpit Arena</option>
          </NativeSelect>
        </div>

        {/* Entrance Fee - Always required */}
        <InputField
          id={isEdit ? "editEntranceFee" : "entranceFee"}
          label="Entrance Fee (PHP) *"
          icon={DollarSign}
          type="number"
          value={formData.entranceFee}
          onChange={(e) => onInputChange('entranceFee', e.target.value)}
          placeholder="Enter entrance fee per person"
          min="0"
          step="0.01"
          required
        />

        {/* Entry Fee - Optional */}
        <InputField
          id={isEdit ? "editEntryFee" : "entryFee"}
          label="Entry Fee (PHP)"
          icon={DollarSign}
          type="number"
          value={formData.entryFee}
          onChange={(e) => onInputChange('entryFee', e.target.value)}
          placeholder="Enter entry fee (optional)"
          min="0"
          step="0.01"
        />

        {/* Cage Rental Fee - Always required */}
        <InputField
          id={isEdit ? "editCageRentalFee" : "cageRentalFee"}
          label="Cage Rental Fee (PHP) *"
          icon={DollarSign}
          type="number"
          value={formData.cageRentalFee}
          onChange={(e) => onInputChange('cageRentalFee', e.target.value)}
          placeholder="Enter cage rental fee per cage"
          min="0"
          step="0.01"
          required
        />

        {/* Date and Time */}
        <InputField
          id={isEdit ? "editDate" : "date"}
          label="Date & Time *"
          icon={Calendar}
          type="datetime-local"
          value={formData.date}
          onChange={(e) => onInputChange('date', e.target.value)}
          required
        />

        {/* Conditional fields - Only show for derby and hits_ulutan events */}
        {(isDerbyEvent || isHitsUlutanEvent) && (
          <>
            {/* Registration Deadline - Only for derby events */}
            {isDerbyEvent && (
              <InputField
                id={isEdit ? "editRegistrationDeadline" : "registrationDeadline"}
                label="Registration Deadline *"
                icon={Clock}
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={(e) => onInputChange('registrationDeadline', e.target.value)}
                required
              />
            )}

            <div className='grid grid-cols-2 gap-4'>
              {/* Prize Pool */}
              <InputField
                id={isEdit ? "editPrize" : "prize"}
                label="Prize Pool (PHP) *"
                icon={DollarSign}
                type="number"
                value={formData.prize}
                onChange={(e) => onInputChange('prize', e.target.value)}
                placeholder="Enter prize amount"
                min="0"
                step="0.01"
                required
              />

              {/* Cock Requirements */}
              <InputField
                id={isEdit ? "editNoCockRequirements" : "noCockRequirements"}
                label="Cock Requirements *"
                icon={Users}
                type="number"
                value={formData.noCockRequirements}
                onChange={(e) => onInputChange('noCockRequirements', e.target.value)}
                placeholder="Enter number of cocks required"
                min="0"
                max="1000"
                required
              />
            </div>

          </>
        )}

        {/* Conditional fields - Only show for fastest_kill events */}
        {isFastestKillEvent && (
          <>
            {/* Prize Pool */}
            <InputField
              id={isEdit ? "editPrize" : "prize"}
              label="Prize Pool (PHP) *"
              icon={DollarSign}
              type="number"
              value={formData.prize}
              onChange={(e) => onInputChange('prize', e.target.value)}
              placeholder="Enter prize amount"
              min="0"
              step="0.01"
              required
            />
          </>
        )}

      </div>
    </CustomAlertDialog>
  )
}

export default EventForm
