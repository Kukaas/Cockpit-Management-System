import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Shield, MapPin, Search, DollarSign } from 'lucide-react'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'
import NativeSelect from '@/components/custom/NativeSelect'
import { useGetAll } from '@/hooks/useApiQueries'

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
  isEdit = false
}) => {
  const [selectedCageId, setSelectedCageId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArena, setSelectedArena] = useState('')

  // Fetch available cages for rental
  const { data: availableCagesResponse, isLoading: isLoadingCages, error: cagesError } = useGetAll('/cage-availability/available-for-rental')

  // Fallback: fetch all cages if available cages endpoint fails
  const { data: allCagesResponse } = useGetAll('/cage-availability')

  // Fetch active events for selection
  const { data: eventsResponse } = useGetAll('/events?status=active')
  const events = eventsResponse || []

  // Extract the cages array from the response correctly
  // The API returns { data: { cages: [...] } } when no date is provided
  // or { data: { availableCages: [...] } } when date is provided
  let availableCages = availableCagesResponse?.data?.cages ||
                      availableCagesResponse?.data?.availableCages ||
                      []

  // If no cages from available endpoint, use all cages as fallback
  if (availableCages.length === 0) {
    // Handle both array and object responses
    if (Array.isArray(allCagesResponse)) {
      availableCages = allCagesResponse.filter(cage => cage.status === 'active')
    } else if (allCagesResponse?.data && Array.isArray(allCagesResponse.data)) {
      availableCages = allCagesResponse.data.filter(cage => cage.status === 'active')
    }
  } else {
    // Filter the available cages to only show active ones
    availableCages = availableCages.filter(cage => cage.status === 'active')
  }

  // Filter cages by selected arena first, then by search query, and only show active cages
  const filteredCages = Array.isArray(availableCages)
    ? availableCages.filter(cage => {
        // Only show active cages (available for rental)
        if (cage.status !== 'active') {
          return false
        }

        // First filter by arena if selected
        if (selectedArena && cage.arena !== selectedArena) {
          return false
        }

        // Then filter by search query if provided
        if (searchQuery) {
          const matchesCageNumber = cage.cageNumber.toLowerCase().includes(searchQuery.toLowerCase())
          return matchesCageNumber
        }

        return true
      })
    : []

  // Define the three available arenas
  const allArenas = [
    'Buenavista Cockpit Arena',
    'Mogpog Cockpit Arena',
    'Boac Cockpit Arena'
  ]

  // Handle cage selection
  const handleCageSelection = (cageId) => {
    setSelectedCageId(cageId)
    if (cageId && Array.isArray(availableCages)) {
      const selectedCage = availableCages.find(cage => cage._id === cageId)
      if (selectedCage) {
        // Auto-fill form with selected cage's data
        onInputChange('cageNo', selectedCage._id)
        onInputChange('arena', selectedCage.arena)
        onInputChange('price', '100') // Default price
      }
    }
  }

  // Handle event selection and auto-set arena
  const handleEventSelection = (eventId) => {
    onInputChange('eventID', eventId)

    if (eventId) {
      const selectedEvent = events.find(event => event._id === eventId)
      if (selectedEvent) {

        // Map event location to arena
        const locationToArena = {
          'Buenavista Cockpit Arena': 'Buenavista Cockpit Arena',
          'Mogpog Cockpit Arena': 'Mogpog Cockpit Arena',
          'Boac Cockpit Arena': 'Boac Cockpit Arena'
        }

        const arena = locationToArena[selectedEvent.location]

        if (arena) {
          setSelectedArena(arena)
        }
      }
    } else {
      // Reset arena if no event selected
      setSelectedArena('')
    }
  }

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (isEdit) {
        // For edit mode, set the selected cage ID from the form data
        // Handle both object (populated) and string (ID) cases
        const cageId = typeof formData.cageNo === 'object' ? formData.cageNo._id : formData.cageNo
        setSelectedCageId(cageId || '')
        setSelectedArena(formData.arena || '')
      } else {
        // For add mode, reset everything
        setSelectedCageId('')
        setSearchQuery('')
        setSelectedArena('')
        // Set default date to today
        const today = new Date().toISOString().split('T')[0]
        onInputChange('date', today)
      }
    }
  }, [open, isEdit, formData.cageNo, formData.arena]) // Added dependencies

  // Get selected cage data for preview
  const selectedCage = Array.isArray(availableCages)
    ? availableCages.find(cage => cage._id === selectedCageId)
    : null

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
            {isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Rental' : 'Create Rental')}
          </Button>
        </>
      }
    >
             <div className="space-y-6 overflow-y-auto pr-2">
         {/* Event Selection */}
         <div className="space-y-4">
           <div className="flex items-center gap-2">
             <MapPin className="h-4 w-4" />
             <Label className="text-sm font-medium">Select Associated Event</Label>
           </div>
                       <div className="space-y-2">
              <Label htmlFor={isEdit ? "editEventID" : "eventID"} className="text-sm font-medium">
                Associated Event *
              </Label>
              {isEdit ? (
                // Show event info as read-only in edit mode
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  {(() => {
                    const selectedEvent = events.find(event => event._id === formData.eventID)
                    return selectedEvent ? (
                      <div className="text-sm">
                        <p className="font-medium">{selectedEvent.eventName}</p>
                        <p className="text-gray-600">
                          {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })} at {new Date(selectedEvent.date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </p>
                        <p className="text-gray-600">@ {selectedEvent.location}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Event information not available</p>
                    )
                  })()}
                </div>
              ) : (
                // Show dropdown in add mode
                <NativeSelect
                  id={isEdit ? "editEventID" : "eventID"}
                  value={formData.eventID || ''}
                  onChange={(e) => handleEventSelection(e.target.value)}
                  placeholder="Select an event (required)"
                  required
                >
                  <option value="">Select an event...</option>
                  {events.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.eventName} - {new Date(event.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {new Date(event.date).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })} @ {event.location}
                    </option>
                  ))}
                </NativeSelect>
              )}
            </div>
         </div>

         <Separator />

         {/* Cage Selection */}
         <div className="space-y-4">
           <div className="flex items-center gap-2">
             <Shield className="h-4 w-4" />
             <Label className="text-sm font-medium">
               {isEdit ? 'Cage Information' : 'Select Available Cage'}
             </Label>
           </div>

            {/* Arena Selection - Only show in add mode */}
            {!isEdit && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Select Arena
                  {selectedArena && formData.eventID && (
                    <span className="text-xs text-green-600 ml-2">(Auto-selected from event)</span>
                  )}
                </Label>
                <NativeSelect
                  value={selectedArena}
                  onChange={(e) => setSelectedArena(e.target.value)}
                  className={selectedArena && formData.eventID ? "border-green-500 bg-green-50" : ""}
                >
                  <option value="">All Arenas</option>
                  {allArenas.map((arena) => (
                    <option key={arena} value={arena}>
                      {arena}
                    </option>
                  ))}
                </NativeSelect>
                {selectedArena && formData.eventID && (
                  <p className="text-xs text-green-600">
                    ✓ Arena automatically selected based on event location
                  </p>
                )}
              </div>
            )}

            {/* Cage Search - Only show in add mode */}
            {!isEdit && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={selectedCageId ? "Search to change cage selection..." : "Search by cage number..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md text-sm"
                />
              </div>
            )}

            {/* Cage List - Only show in add mode when no cage is selected OR when searching */}
            {!isEdit && filteredCages.length > 0 && (!selectedCageId || searchQuery) && (
              <div className={`border rounded-md ${filteredCages.length > 3 ? 'max-h-48 overflow-y-auto' : ''}`}>
                {filteredCages.map((cage) => (
                  <div
                    key={cage._id}
                    className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${
                      selectedCageId === cage._id ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleCageSelection(cage._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{cage.cageNumber}</p>
                        <p className="text-xs text-muted-foreground">{cage.arena}</p>
                        {cage.description && (
                          <p className="text-xs text-muted-foreground">{cage.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            cage.status === 'active' ? 'default' :
                            cage.status === 'rented' ? 'secondary' :
                            cage.status === 'maintenance' ? 'destructive' :
                            'outline'
                          }
                          className="text-xs"
                        >
                          {cage.status === 'active' ? 'Available' :
                           cage.status === 'rented' ? 'Rented' :
                           cage.status === 'maintenance' ? 'Maintenance' :
                           cage.status === 'inactive' ? 'Inactive' :
                           cage.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          #{cage.availabilityNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No cages found - Only show in add mode */}
            {!isEdit && !isLoadingCages && !cagesError && filteredCages.length === 0 && (!selectedCageId || searchQuery) && (
              <div className="text-center py-4 text-muted-foreground">
                {selectedArena && searchQuery ? (
                  <>
                    <p className="text-sm">No available cages found in {selectedArena} matching "{searchQuery}"</p>
                    <p className="text-xs">Only active cages are shown. Try a different search term or select a different arena</p>
                  </>
                ) : selectedArena ? (
                  <>
                    <p className="text-sm">No available cages found in {selectedArena}</p>
                    <p className="text-xs">Only active cages are shown. All cages might be rented, inactive, or under maintenance</p>
                  </>
                ) : searchQuery ? (
                  <>
                    <p className="text-sm">No available cages found matching "{searchQuery}"</p>
                    <p className="text-xs">Only active cages are shown. Try a different search term</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm">No available cages found</p>
                    <p className="text-xs">Only active cages are shown. All cages might be rented, inactive, or under maintenance</p>
                  </>
                )}
              </div>
            )}

            {/* Loading and Error States - Only show in add mode */}
            {!isEdit && isLoadingCages && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">Loading available cages...</p>
              </div>
            )}

            {!isEdit && cagesError && (
              <div className="text-center py-4 text-red-600">
                <p className="text-sm">Error loading cages: {cagesError.message}</p>
              </div>
            )}

            {/* Selected Cage Preview - Show in both add and edit modes */}
            {selectedCageId && selectedCage && (
              <div className="bg-green-50 p-3 rounded-md border border-green-200">
                <p className="text-sm text-green-800 mb-2">
                  {isEdit ? '✓ Current cage information:' : '✓ Selected cage. Information auto-filled below.'}
                </p>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{isEdit ? 'Current Cage:' : 'Selected Cage:'}</h4>
                    <Badge
                      variant={
                        selectedCage.status === 'active' ? 'default' :
                        selectedCage.status === 'rented' ? 'secondary' :
                        selectedCage.status === 'maintenance' ? 'destructive' :
                        'outline'
                      }
                      className="text-xs"
                    >
                      {selectedCage.status === 'active' ? 'Available' :
                       selectedCage.status === 'rented' ? 'Rented' :
                       selectedCage.status === 'maintenance' ? 'Maintenance' :
                       selectedCage.status === 'inactive' ? 'Inactive' :
                       selectedCage.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Cage Number:</span> {selectedCage.cageNumber}</p>
                    <p><span className="font-medium">Arena:</span> {selectedCage.arena}</p>
                    <p><span className="font-medium">Availability No:</span> #{selectedCage.availabilityNumber}</p>
                    {selectedCage.description && (
                      <p><span className="font-medium">Description:</span> {selectedCage.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>



        {/* Rental Information Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id={isEdit ? "editCageNo" : "cageNo"}
              label="Cage Number"
              value={
                // Handle both object (populated) and string (ID) cases
                typeof formData.cageNo === 'object' && formData.cageNo?.cageNumber
                  ? formData.cageNo.cageNumber
                  : selectedCage?.cageNumber || formData.cageNo || ''
              }
              onChange={() => {}}
              placeholder="Auto-filled from cage selection"
              disabled
              readOnly
            />
            <InputField
              id={isEdit ? "editArena" : "arena"}
              label="Arena"
              value={formData.arena}
              onChange={() => {}}
              placeholder="Auto-filled from cage selection"
              disabled
              readOnly
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id={isEdit ? "editPrice" : "price"}
              label="Price (PHP) *"
              type="number"
              value={formData.price}
              onChange={() => {}}
              placeholder="Fixed price: 100 PHP"
              min="0"
              step="0.01"
              required
              disabled
              readOnly
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

          <InputField
            id={isEdit ? "editNameOfRenter" : "nameOfRenter"}
            label="Renter Name *"
            value={formData.nameOfRenter}
            onChange={(e) => onInputChange('nameOfRenter', e.target.value)}
            placeholder="Enter renter's full name"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              id={isEdit ? "editContactNumber" : "contactNumber"}
              label="Contact Number"
              value={formData.contactNumber}
              onChange={(e) => onInputChange('contactNumber', e.target.value)}
              placeholder="Enter contact number"
            />
            <InputField
              id={isEdit ? "editEmail" : "email"}
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              placeholder="Enter email address"
            />
          </div>


          <div className="space-y-2">
            <Label htmlFor={isEdit ? "editPaymentStatus" : "paymentStatus"} className="text-sm font-medium">
              Payment Status
            </Label>
            <NativeSelect
              id={isEdit ? "editPaymentStatus" : "paymentStatus"}
              value={formData.paymentStatus}
              onChange={(e) => onInputChange('paymentStatus', e.target.value)}
              placeholder="Select payment status"
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </NativeSelect>
          </div>

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
      </div>
    </CustomAlertDialog>
  )
}

export default RentalForm
