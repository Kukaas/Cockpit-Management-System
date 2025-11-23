import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Shield, MapPin, DollarSign, Search } from 'lucide-react'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'
import NativeSelect from '@/components/custom/NativeSelect'
import { useGetAll, useGetById } from '@/hooks/useApiQueries'

const RentalForm = ({
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
  eventId,
  rentalData = null // Pass the rental data for edit mode
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCages, setSelectedCages] = useState([])

  // Fetch event to get cageRentalFee
  const { data: event } = useGetById('/events', eventId)

  // Fetch available cages for the selected arena and date
  // In edit mode, exclude current rental so its cages show as available
  const apiUrl = formData.arena && formData.date
    ? `/cage-rentals/available?date=${formData.date}&arena=${formData.arena}${isEdit && rentalData?._id ? `&excludeRentalId=${rentalData._id}` : ''}`
    : null

  const { data: availableCagesResponse, isLoading: isLoadingCages } = useGetAll(apiUrl)

  // Get available cages from response
  let availableCages = availableCagesResponse?.availableCages || []

  // In edit mode, ensure the currently rented cages are included in the available cages list
  // This ensures they show up in the selection UI even if they're not in the availableCages response
  if (isEdit && rentalData?.cages && availableCagesResponse) {
    const currentRentalCages = rentalData.cages
      .map(cage => cage.cageNo)
      .filter(Boolean) // Filter out any null/undefined

    if (currentRentalCages.length > 0) {
      // Get IDs of current rental cages
      const currentRentalCageIds = currentRentalCages.map(c => c._id?.toString() || c.toString())
      const availableCageIds = availableCages.map(c => c._id?.toString())

      // Add current rental cages that aren't already in available cages
      const additionalCages = currentRentalCages.filter(cage => {
        const cageId = cage._id?.toString() || cage.toString()
        return !availableCageIds.includes(cageId)
      })

      // Combine available cages with current rental cages
      availableCages = [...availableCages, ...additionalCages]
    }
  }

  // Filter cages by search query
  const filteredCages = availableCages.filter(cage => {
    if (searchQuery) {
      return cage.cageNumber.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })



  // Handle cage selection
  const handleCageSelection = (cage) => {
    const cageId = cage._id?.toString() || cage.toString()
    const isSelected = selectedCages.some(selected => {
      const selectedId = selected._id?.toString() || selected.toString()
      return selectedId === cageId
    })

    if (isSelected) {
      // Remove cage from selection
      const updatedCages = selectedCages.filter(selected => {
        const selectedId = selected._id?.toString() || selected.toString()
        return selectedId !== cageId
      })
      setSelectedCages(updatedCages)
      onInputChange('quantity', updatedCages.length.toString())
      onInputChange('selectedCageIds', updatedCages.map(c => c._id || c))
    } else {
      // Add cage to selection
      const updatedCages = [...selectedCages, cage]
      setSelectedCages(updatedCages)
      onInputChange('quantity', updatedCages.length.toString())
      onInputChange('selectedCageIds', updatedCages.map(c => c._id || c))
    }
  }

  // Use a ref to track if we've already initialized to prevent re-initialization
  const hasInitializedCages = useRef(false)

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (isEdit && rentalData) {
        // For edit mode, reset the initialization flag when dialog opens
        hasInitializedCages.current = false
        setSearchQuery('')
        // Don't set selectedCages here - let the second useEffect handle it
        // when availableCages are loaded to ensure proper matching
      } else {
        // For add mode, reset everything to ensure clean form
        setSearchQuery('')
        setSelectedCages([])
        // Clear all form fields - parent component should handle this via resetRentalForm
        // But we ensure local state is also cleared
        onInputChange('quantity', '0')
        onInputChange('nameOfRenter', '')
        onInputChange('contactNumber', '')
        onInputChange('selectedCageIds', [])
        // Set defaults
        const today = new Date().toISOString().split('T')[0]
        onInputChange('date', today)
        onInputChange('paymentStatus', 'unpaid')
      }
    } else {
      // When dialog closes, reset local state and initialization flag
      hasInitializedCages.current = false
      setSearchQuery('')
      setSelectedCages([])
    }
  }, [open, isEdit, rentalData])

  // When available cages are loaded in edit mode, ensure selected cages are set
  // This handles the case where rental data loads before available cages
  useEffect(() => {
    // Only initialize once when dialog opens and we have both rental data and available cages
    // Don't re-initialize if user has already made changes
    if (open && isEdit && rentalData?.cages && availableCages.length > 0 && !hasInitializedCages.current) {
      // Extract cages from rental data and match them with available cages
      const rentalCages = rentalData.cages
        ?.map(cage => {
          const cageId = cage.cageNo?._id?.toString() || cage.cageNo?.toString() || cage.cageNo
          // Find the cage in availableCages by ID
          const foundCage = availableCages.find(ac => {
            const acId = ac._id?.toString() || ac.toString()
            return acId === cageId
          })
          // Use found cage or the populated cageNo object
          return foundCage || (cage.cageNo && typeof cage.cageNo === 'object' ? cage.cageNo : null)
        })
        .filter(Boolean)

      if (rentalCages.length > 0) {
        setSelectedCages(rentalCages)
        onInputChange('quantity', rentalCages.length.toString())
        onInputChange('selectedCageIds', rentalCages.map(c => c._id || c))
        hasInitializedCages.current = true
      }
    }
  }, [open, isEdit, rentalData, availableCages.length])

  // Calculate total price using event's cageRentalFee
  const rentalFeePerCage = event?.cageRentalFee || 20 // Default to 20 if not set
  // Use selectedCages length for both add and edit mode
  const totalPrice = selectedCages.length * rentalFeePerCage

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
          <Button
            onClick={onSubmit}
            disabled={
              isPending || selectedCages.length === 0
            }
          >
            {isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Rental' : 'Create Rental')}
          </Button>
        </>
      }
    >
      <div className="space-y-6 overflow-y-auto pr-2">



        {/* Arena Display - Auto-selected from event */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <Label className="text-sm font-medium">Arena (Auto-selected from event)</Label>
          </div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800 font-medium">{formData.arena}</p>
            <p className="text-xs text-green-600 mt-1">✓ Arena automatically selected based on event location</p>
          </div>
        </div>

        {/* Cage Selection */}
        {(
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <Label className="text-sm font-medium">Select Cages to Rent</Label>
            </div>

            {/* Available cages info */}
            {!isLoadingCages && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Available cages in {formData.arena}:</span> {availableCages.length}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Select the specific cages you want to rent. These cage numbers will be given to the renter.
                </p>
              </div>
            )}

            {/* Cage Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by cage number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md text-sm"
              />
            </div>

            {/* Cage List */}
            {filteredCages.length > 0 && (
              <div className="border rounded-md max-h-48 overflow-y-auto">
                {filteredCages.map((cage) => {
                  const isSelected = selectedCages.some(selected => {
                    const selectedId = selected._id?.toString() || selected.toString()
                    const cageId = cage._id?.toString() || cage.toString()
                    return selectedId === cageId
                  })
                  return (
                    <div
                      key={cage._id}
                      className={`p-3 border-b hover:bg-muted/50 cursor-pointer ${isSelected ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      onClick={() => handleCageSelection(cage)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleCageSelection(cage)}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div>
                            <p className="font-medium text-sm">Cage {cage.cageNumber}</p>
                            <p className="text-xs text-muted-foreground">{cage.arena}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* No cages found */}
            {!isLoadingCages && filteredCages.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                {searchQuery ? (
                  <>
                    <p className="text-sm">No available cages found matching "{searchQuery}"</p>
                    <p className="text-xs">Try a different search term</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm">No available cages found in {formData.arena}</p>
                    <p className="text-xs">All cages might be rented, inactive, or under maintenance</p>
                  </>
                )}
              </div>
            )}

            {/* Loading state */}
            {isLoadingCages && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">Loading available cages...</p>
              </div>
            )}
          </div>
        )}

        {/* Selected Cages Summary */}
        {selectedCages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox checked={true} disabled className="h-4 w-4 text-green-600" />
              <Label className="text-sm font-medium">Selected Cages ({selectedCages.length})</Label>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex flex-wrap gap-2">
                {selectedCages.map((cage) => (
                  <Badge key={cage._id} variant="default" className="text-xs">
                    Cage {cage.cageNumber}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-green-600 mt-2">
                ✓ These cage numbers will be given to the renter
              </p>
            </div>
          </div>
        )}

        {/* Rental Information Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id={isEdit ? "editQuantity" : "quantity"}
              label="Quantity of Cages"
              type="number"
              value={selectedCages.length.toString()}
              onChange={(e) => {
                // Quantity is read-only, controlled by cage selection
              }}
              placeholder="Auto-calculated from cage selection"
              min="1"
              disabled={true}
              readOnly={true}
            />
            <InputField
              id={isEdit ? "editDate" : "date"}
              label="Rental Date *"
              type="date"
              value={formData.date}
              onChange={(e) => onInputChange('date', e.target.value)}
              required
            />
          </div>

          {/* Total Price Display */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Price</p>
                <p className="text-xs text-gray-600">
                  {rentalFeePerCage.toLocaleString('en-PH', {
                    style: 'currency',
                    currency: 'PHP'
                  })} per cage
                </p>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-lg font-bold text-green-600">
                  {totalPrice.toLocaleString('en-PH', {
                    style: 'currency',
                    currency: 'PHP'
                  })}
                </span>
              </div>
            </div>
          </div>

          <InputField
            id={isEdit ? "editNameOfRenter" : "nameOfRenter"}
            label="Renter Name *"
            value={formData.nameOfRenter}
            onChange={(e) => onInputChange('nameOfRenter', e.target.value)}
            placeholder="Enter renter's full name"
            required
          />

          <InputField
            id={isEdit ? "editContactNumber" : "contactNumber"}
            label="Contact Number"
            value={formData.contactNumber}
            onChange={(e) => onInputChange('contactNumber', e.target.value)}
            placeholder="Enter contact number"
          />

          <div className="space-y-2">
            <Label htmlFor={isEdit ? "editPaymentStatus" : "paymentStatus"} className="text-sm font-medium">
              Payment Status
            </Label>
            <NativeSelect
              id={isEdit ? "editPaymentStatus" : "paymentStatus"}
              value={formData.paymentStatus || 'unpaid'}
              onChange={(e) => onInputChange('paymentStatus', e.target.value)}
              placeholder="Select payment status"
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </NativeSelect>
          </div>
        </div>
      </div>
    </CustomAlertDialog>
  )
}

export default RentalForm
