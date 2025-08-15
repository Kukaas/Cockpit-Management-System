import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'
import NativeSelect from '@/components/custom/NativeSelect'
import { Calendar, MapPin, DollarSign, Hash, Clock, Users, FileText } from 'lucide-react'

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
            <option value="special">Special</option>
            <option value="championship">Championship</option>
            <option value="exhibition">Exhibition</option>
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
            <option value="Mogpog Cockpit Arena">Mogpog Cockpit Arena</option>
            <option value="Buenavista Cockpit Arena">Buenavista Cockpit Arena</option>
            <option value="Boac Cockpit Arena">Boac Cockpit Arena</option>
          </NativeSelect>
        </div>

        {/* Entry Fee - Always required */}
        <InputField
          id={isEdit ? "editEntryFee" : "entryFee"}
          label="Entry Fee (PHP) *"
          icon={DollarSign}
          type="number"
          value={formData.entryFee}
          onChange={(e) => onInputChange('entryFee', e.target.value)}
          placeholder="Enter entry fee"
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


        {/* Conditional fields - Only show for non-regular events */}
        {!isRegularEvent && (
          <>
            {/* Registration Deadline */}
            <InputField
              id={isEdit ? "editRegistrationDeadline" : "registrationDeadline"}
              label="Registration Deadline"
              icon={Clock}
              type="datetime-local"
              value={formData.registrationDeadline}
              onChange={(e) => onInputChange('registrationDeadline', e.target.value)}
            />

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

              {/* Minimum Bet */}
              <InputField
                id={isEdit ? "editMinimumBet" : "minimumBet"}
                label="Minimum Bet (PHP) *"
                icon={Hash}
                type="number"
                value={formData.minimumBet}
                onChange={(e) => onInputChange('minimumBet', e.target.value)}
                placeholder="Enter minimum bet"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
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

              {/* Max Participants */}
              <InputField
                id={isEdit ? "editMaxParticipants" : "maxParticipants"}
                label="Max Participants"
                icon={Users}
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => onInputChange('maxParticipants', e.target.value)}
                placeholder="Enter max participants (optional)"
                min="1"
              />
            </div>
          </>
        )}

        {/* Public Toggle */}
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "editIsPublic" : "isPublic"} className="text-sm font-medium">
            Public Event
          </Label>
          <NativeSelect
            id={isEdit ? "editIsPublic" : "isPublic"}
            value={formData.isPublic.toString()}
            onChange={(e) => onInputChange('isPublic', e.target.value === 'true')}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </NativeSelect>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "editDescription" : "description"} className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id={isEdit ? "editDescription" : "description"}
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Enter event description (optional)"
            rows={3}
          />
        </div>
      </div>
    </CustomAlertDialog>
  )
}

export default EventForm
