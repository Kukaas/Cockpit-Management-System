import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'
import NativeSelect from '@/components/custom/NativeSelect'
import { Calendar, Hash, Clock, Users, FileText, DollarSign, Weight } from 'lucide-react'
import { toast } from 'sonner'

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

        {/* Host Name */}
        <InputField
          id={isEdit ? "editHost" : "host"}
          label="Host Name"
          icon={Users}
          value={formData.host}
          onChange={(e) => onInputChange('host', e.target.value)}
          placeholder="Enter host name (optional)"
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

        <div className='grid grid-cols-2 gap-4'>
          {/* Minimum Bet - Required for all events */}
          <InputField
            id={isEdit ? "editMinimumBet" : "minimumBet"}
            label="Minimum Bet (PHP) *"
            icon={DollarSign}
            type="number"
            value={formData.minimumBet}
            onChange={(e) => onInputChange('minimumBet', e.target.value)}
            placeholder="Enter minimum bet"
            min="0"
            step="0.01"
            required
          />

          {/* Minimum Participants - Required for all events */}
          <InputField
            id={isEdit ? "editMinimumParticipants" : "minimumParticipants"}
            label="Minimum Participants *"
            icon={Users}
            type="number"
            value={formData.minimumParticipants}
            onChange={(e) => onInputChange('minimumParticipants', e.target.value)}
            placeholder="Enter minimum participants"
            min="1"
            required
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          {/* Entrance Fee - Optional */}
          <InputField
            id={isEdit ? "editEntranceFee" : "entranceFee"}
            label="Entrance Fee (PHP)"
            type="number"
            value={formData.entranceFee}
            onChange={(e) => onInputChange('entranceFee', e.target.value)}
            placeholder="Enter entrance fee per person (optional)"
            min="0"
            step="0.01"
          />

          {/* Cage Rental Fee - Always required */}
          <InputField
            id={isEdit ? "editCageRentalFee" : "cageRentalFee"}
            label="Cage Rental Fee (PHP) *"
            type="number"
            value={formData.cageRentalFee}
            onChange={(e) => onInputChange('cageRentalFee', e.target.value)}
            placeholder="Enter cage rental fee per cage"
            min="0"
            step="0.01"
            required
          />
        </div>

        {/* Entry Fee - Optional */}
        <InputField
          id={isEdit ? "editEntryFee" : "entryFee"}
          label="Entry Fee (PHP)"
          type="number"
          value={formData.entryFee}
          onChange={(e) => onInputChange('entryFee', e.target.value)}
          placeholder="Enter entry fee (optional)"
          min="0"
          step="0.01"
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

            {/* Derby-specific weight fields */}
            {isDerbyEvent && (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  {/* Minimum Weight */}
                  <InputField
                    id={isEdit ? "editMinWeight" : "minWeight"}
                    label="Minimum Weight (g) *"
                    icon={Weight}
                    type="number"
                    value={formData.minWeight}
                    onChange={(e) => onInputChange('minWeight', e.target.value)}
                    placeholder="e.g., 1600"
                    min="10"
                    max="10000"
                    step="1"
                    required
                  />

                  {/* Maximum Weight */}
                  <InputField
                    id={isEdit ? "editMaxWeight" : "maxWeight"}
                    label="Maximum Weight (g) *"
                    icon={Weight}
                    type="number"
                    value={formData.maxWeight}
                    onChange={(e) => onInputChange('maxWeight', e.target.value)}
                    placeholder="e.g., 2000"
                    min="10"
                    max="10000"
                    step="1"
                    required
                  />
                </div>
              </div>
            )}

          </>
        )}

        {/* Conditional fields - Only show for fastest_kill events */}
        {isFastestKillEvent && (
          <>
            <div className='grid grid-cols-2 gap-4'>
              {/* Prize Pool */}
              <InputField
                id={isEdit ? "editPrize" : "prize"}
                label="Prize Pool (PHP) *"
                type="number"
                value={formData.prize}
                onChange={(e) => onInputChange('prize', e.target.value)}
                placeholder="Enter prize amount"
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Prize Distribution Configuration */}
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Prize Distribution *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const tiers = [...formData.prizeDistribution];
                    if (tiers.length > 0) {
                      const lastIndex = tiers.length - 1;
                      const lastPercentage = Number(tiers[lastIndex].percentage || 0);
                      const half = Math.floor(lastPercentage / 2);
                      const remainingHalf = lastPercentage - half;

                      // Update last tier to have half
                      tiers[lastIndex].percentage = half;

                      // Create new tier with the other half
                      const newTier = {
                        tierName: `Tier ${tiers.length + 1}`,
                        startRank: tiers[lastIndex].endRank + 1,
                        endRank: tiers[lastIndex].endRank + 5,
                        percentage: remainingHalf
                      };
                      onInputChange('prizeDistribution', [...tiers, newTier]);
                    } else {
                      // Fallback if somehow there are no tiers
                      const newTier = {
                        tierName: 'Tier 1',
                        startRank: 1,
                        endRank: 5,
                        percentage: 100
                      };
                      onInputChange('prizeDistribution', [newTier]);
                    }
                  }}
                >
                  Add Tier
                </Button>
              </div>

              {formData.prizeDistribution.map((tier, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <InputField
                      id={`tierName-${index}`}
                      label=""
                      value={tier.tierName}
                      onChange={(e) => {
                        const updated = [...formData.prizeDistribution];
                        updated[index].tierName = e.target.value;
                        onInputChange('prizeDistribution', updated);
                      }}
                      placeholder="Tier name"
                      className="flex-1 mr-2"
                    />
                    {formData.prizeDistribution.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = formData.prizeDistribution.filter((_, i) => i !== index);
                          onInputChange('prizeDistribution', updated);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <InputField
                      id={`startRank-${index}`}
                      label="Start Rank"
                      type="number"
                      value={tier.startRank}
                      onChange={(e) => {
                        const updated = [...formData.prizeDistribution];
                        updated[index].startRank = e.target.value === '' ? '' : Number(e.target.value);
                        onInputChange('prizeDistribution', updated);
                      }}
                      min="1"
                      required
                    />
                    <InputField
                      id={`endRank-${index}`}
                      label="End Rank"
                      type="number"
                      value={tier.endRank}
                      onChange={(e) => {
                        const updated = [...formData.prizeDistribution];
                        updated[index].endRank = e.target.value === '' ? '' : Number(e.target.value);
                        onInputChange('prizeDistribution', updated);
                      }}
                      min="1"
                      required
                    />
                    <InputField
                      id={`percentage-${index}`}
                      label="Percentage %"
                      type="number"
                      value={tier.percentage}
                      onChange={(e) => {
                        const updated = [...formData.prizeDistribution];
                        let value = e.target.value === '' ? '' : Number(e.target.value);

                        // Rule: Tier N cannot be higher than Tier N-1
                        let maxAllowed = 100;
                        if (index > 0) {
                          maxAllowed = Number(updated[index - 1].percentage || 0);
                        }

                        if (value !== '' && value > maxAllowed) {
                          toast.error(`Tier ${index + 1} cannot exceed ${maxAllowed}% (Tier ${index} limit)`, {
                            id: `tier-max-${index}`
                          });
                          value = maxAllowed;
                        }

                        // NEW: Minimum Check Notification
                        const sumBeforeThis = updated.slice(0, index).reduce((sum, t) => sum + Number(t.percentage || 0), 0);
                        const remainingToDistribute = 100 - sumBeforeThis;
                        const remainingTiersCount = updated.length - index;
                        const minRequired = Number((remainingToDistribute / remainingTiersCount).toFixed(2));

                        if (value !== '' && value < minRequired && remainingTiersCount > 1) {
                          toast.info(`Note: Tier ${index + 1} should be at least ${minRequired}% to reach 100%.`, {
                            id: `tier-min-${index}`
                          });
                        }

                        updated[index].percentage = value;

                        // Auto-calculate and distribute remainder for ALL subsequent tiers
                        for (let i = index + 1; i < updated.length; i++) {
                          const sumBefore = updated.slice(0, i).reduce((sum, t) => sum + Number(t.percentage || 0), 0);
                          const remaining = Math.max(0, 100 - sumBefore);
                          const remainingTiersCount = updated.length - i;

                          // Divide remainder equally
                          const idealShare = Number((remaining / remainingTiersCount).toFixed(2));
                          const prevPercentage = Number(updated[i - 1].percentage || 0);

                          // Rule: Tier N must be <= the tier above it
                          // This will naturally cap the sum to 100 if possible,
                          // but won't force Tier 1 to a minimum value.
                          updated[i].percentage = Math.min(idealShare, prevPercentage);
                        }

                        onInputChange('prizeDistribution', updated);
                      }}
                      min="0"
                      max="100"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between p-2 bg-primary/10 rounded">
                <span className="text-sm font-medium">Total Percentage:</span>
                <span className={`text-sm font-bold ${formData.prizeDistribution.reduce((sum, tier) => sum + Number(tier.percentage || 0), 0) === 100
                  ? 'text-green-600'
                  : 'text-destructive'
                  }`}>
                  {formData.prizeDistribution.reduce((sum, tier) => sum + Number(tier.percentage || 0), 0).toFixed(2)}%
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                Configure how the prize pool will be distributed among winners. Percentages must sum to 100%.
              </p>
            </div>
          </>
        )}

      </div>
    </CustomAlertDialog>
  )
}

export default EventForm
