import React, { useState } from 'react'
import DataTable from '@/components/custom/DataTable'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import ConfirmationDialog from '@/components/custom/ConfirmationDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import InputField from '@/components/custom/InputField'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Edit, Plus, Trash2, Calendar, MapPin, DollarSign, Users, FileText, Hash, Clock, Users as UsersIcon } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { toast } from 'sonner'
import NativeSelect from '@/components/custom/NativeSelect'
import { useGetAll } from '@/hooks/useApiQueries'
import { useCreateMutation, usePutMutation, useCustomMutation } from '@/hooks/useApiMutations'
import api from '@/services/api'

const Events = () => {
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false)
  const [editEventDialogOpen, setEditEventDialogOpen] = useState(false)
  const [deleteEventDialogOpen, setDeleteEventDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [formData, setFormData] = useState({
    eventName: '',
    location: '',
    date: '',
    prize: '',
    entryFee: '',
    minimumBet: '',
    eventType: '',
    noCockRequirements: '',
    description: '',
    maxParticipants: '',
    registrationDeadline: '',
    isPublic: true
  })
  const [editFormData, setEditFormData] = useState({
    eventName: '',
    location: '',
    date: '',
    prize: '',
    entryFee: '',
    minimumBet: '',
    eventType: '',
    noCockRequirements: '',
    description: '',
    maxParticipants: '',
    registrationDeadline: '',
    isPublic: true
  })

  // Fetch events with general hook
  const { data: events = [], isLoading, error, refetch } = useGetAll('/events')

  // Handle query error
  React.useEffect(() => {
    if (error) {
      toast.error('Failed to fetch events')
    }
  }, [error])

  // Create event mutation with general hook
  const createEventMutation = useCreateMutation('/events', {
    successMessage: 'Event created successfully',
    errorMessage: 'Failed to create event',
    queryKey: ['/events'],
    onSuccess: () => {
      handleDialogClose()
      refetch()
    },
  })

  // Update event mutation with general hook
  const updateEventMutation = usePutMutation('/events', {
    successMessage: 'Event updated successfully',
    errorMessage: 'Failed to update event',
    queryKey: ['/events'],
    onSuccess: () => {
      handleEditDialogClose()
      refetch()
    },
  })

  // Delete event mutation
  const deleteEventMutation = useCustomMutation(
    async ({ id }) => {
      const response = await api.delete(`/events/${id}`)
      return response.data
    },
    {
      successMessage: 'Event deleted successfully',
      errorMessage: 'Failed to delete event',
      queryKey: ['/events'],
      onSuccess: () => {
        setDeleteEventDialogOpen(false)
        setSelectedEvent(null)
        refetch()
      },
    }
  )



  const handleAddEvent = async () => {
    // Validate required fields
    const requiredFields = ['eventName', 'location', 'date', 'prize', 'entryFee', 'minimumBet', 'eventType', 'noCockRequirements']
    const missingFields = requiredFields.filter(field => !formData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    // Validate date is in the future
    const eventDate = new Date(formData.date)
    if (eventDate <= new Date()) {
      toast.error('Event date must be in the future')
      return
    }

    // Validate numeric fields
    const numericFields = ['prize', 'entryFee', 'minimumBet', 'noCockRequirements']
    for (const field of numericFields) {
      if (isNaN(formData[field]) || Number(formData[field]) < 0) {
        toast.error(`${field} must be a valid positive number`)
        return
      }
    }

    createEventMutation.mutate(formData)
  }

  const handleEditEvent = async () => {
    // Validate required fields
    const requiredFields = ['eventName', 'location', 'date', 'prize', 'entryFee', 'minimumBet', 'eventType', 'noCockRequirements']
    const missingFields = requiredFields.filter(field => !editFormData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    if (!selectedEvent) return

    // Validate date is in the future
    const eventDate = new Date(editFormData.date)
    if (eventDate <= new Date()) {
      toast.error('Event date must be in the future')
      return
    }

    updateEventMutation.mutate({
      id: selectedEvent._id,
      data: editFormData
    })
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      eventName: '',
      location: '',
      date: '',
      prize: '',
      entryFee: '',
      minimumBet: '',
      eventType: '',
      noCockRequirements: '',
      description: '',
      maxParticipants: '',
      registrationDeadline: '',
      isPublic: true
    })
  }

  const resetEditForm = () => {
    setEditFormData({
      eventName: '',
      location: '',
      date: '',
      prize: '',
      entryFee: '',
      minimumBet: '',
      eventType: '',
      noCockRequirements: '',
      description: '',
      maxParticipants: '',
      registrationDeadline: '',
      isPublic: true
    })
  }

  const handleDialogClose = () => {
    setAddEventDialogOpen(false)
    resetForm()
  }

  const handleEditDialogClose = () => {
    setEditEventDialogOpen(false)
    setSelectedEvent(null)
    resetEditForm()
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return
    deleteEventMutation.mutate({ id: selectedEvent._id })
  }



  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  // Column configuration
  const columns = [
    {
      key: 'eventName',
      label: 'Event Name',
      sortable: true,
      filterable: false,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium">{value}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {row.location}
          </span>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date & Time',
      sortable: true,
      filterable: false,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(value)}</span>
        </div>
      )
    },
    {
      key: 'eventType',
      label: 'Type',
      sortable: true,
      filterable: true,
      filterOptions: ['Regular', 'Special', 'Championship', 'Exhibition'],
      filterValueMap: {
        'Regular': 'regular',
        'Special': 'special',
        'Championship': 'championship',
        'Exhibition': 'exhibition'
      },
      render: (value) => (
        <Badge
          variant={
            value === 'championship' ? 'destructive' :
            value === 'special' ? 'default' :
            value === 'exhibition' ? 'secondary' : 'outline'
          }
          className="text-xs capitalize"
        >
          {value}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Draft', 'Active', 'Completed', 'Cancelled'],
      filterValueMap: {
        'Draft': 'draft',
        'Active': 'active',
        'Completed': 'completed',
        'Cancelled': 'cancelled'
      },
      render: (value) => (
        <Badge
          variant={
            value === 'active' ? 'default' :
            value === 'completed' ? 'secondary' :
            value === 'cancelled' ? 'destructive' : 'outline'
          }
          className="text-xs capitalize"
        >
          {value}
        </Badge>
      )
    },
    {
      key: 'prize',
      label: 'Prize Pool',
      sortable: true,
      filterable: false,
      render: (value) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">{formatCurrency(value)}</span>
        </div>
      )
    },
    {
      key: 'entryFee',
      label: 'Entry Fee',
      sortable: true,
      filterable: false,
      render: (value) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-blue-600" />
          <span>{formatCurrency(value)}</span>
        </div>
      )
    },
    {
      key: 'noCockRequirements',
      label: 'Cock Requirements',
      sortable: true,
      filterable: false,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      filterable: false,
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleEditEventClick(row)
            }}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteEventClick(row)
            }}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  // Action handlers
  const handleEditEventClick = (event) => {
    setSelectedEvent(event)
    setEditFormData({
      eventName: event.eventName,
      location: event.location,
      date: new Date(event.date).toISOString().slice(0, 16),
      prize: event.prize.toString(),
      entryFee: event.entryFee.toString(),
      minimumBet: event.minimumBet.toString(),
      eventType: event.eventType,
      noCockRequirements: event.noCockRequirements.toString(),
      description: event.description || '',
      maxParticipants: event.maxParticipants?.toString() || '',
      registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : '',
      isPublic: event.isPublic
    })
    setEditEventDialogOpen(true)
  }

  const handleDeleteEventClick = (event) => {
    setSelectedEvent(event)
    setDeleteEventDialogOpen(true)
  }

  const handleRowClick = (event) => {
    console.log('Row clicked:', event)
    // Implement row click logic (e.g., navigate to event detail page)
  }

  return (
    <PageLayout
      title="Event Management"
      description="Manage cockfighting events, schedules, and details"
      headerButton={
        <Button onClick={() => setAddEventDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      }
    >
      {/* Add Event Dialog */}
      <CustomAlertDialog
        open={addEventDialogOpen}
        onOpenChange={setAddEventDialogOpen}
        title="Add New Event"
        description="Create a new cockfighting event with all necessary details."
        maxHeight="max-h-[90vh]"
        actions={
          <>
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent} disabled={createEventMutation.isPending}>
              {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          </>
        }
      >
                 <div className="space-y-6 overflow-y-auto pr-2">
           {/* Event Name */}
           <InputField
             id="eventName"
             label="Event Name *"
             icon={FileText}
             value={formData.eventName}
             onChange={(e) => handleInputChange('eventName', e.target.value)}
             placeholder="Enter event name"
             required
           />

                       {/* Location */}
            <InputField
              id="location"
              label="Location *"
              icon={MapPin}
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter event location"
              required
            />

                        {/* Date and Time */}
            <InputField
              id="date"
              label="Date & Time *"
              icon={Calendar}
              type="datetime-local"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />

            {/* Registration Deadline */}
            <InputField
              id="registrationDeadline"
              label="Registration Deadline"
              icon={Clock}
              type="datetime-local"
              value={formData.registrationDeadline}
              onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
            />

            {/* Prize and Entry Fee */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <InputField
               id="prize"
               label="Prize Pool (PHP) *"
               icon={DollarSign}
               type="number"
               value={formData.prize}
               onChange={(e) => handleInputChange('prize', e.target.value)}
               placeholder="Enter prize amount"
               min="0"
               step="0.01"
               required
             />
             <InputField
               id="entryFee"
               label="Entry Fee (PHP) *"
               icon={DollarSign}
               type="number"
               value={formData.entryFee}
               onChange={(e) => handleInputChange('entryFee', e.target.value)}
               placeholder="Enter entry fee"
               min="0"
               step="0.01"
               required
             />
           </div>

           {/* Minimum Bet and Event Type */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <InputField
               id="minimumBet"
               label="Minimum Bet (PHP) *"
               icon={Hash}
               type="number"
               value={formData.minimumBet}
               onChange={(e) => handleInputChange('minimumBet', e.target.value)}
               placeholder="Enter minimum bet"
               min="0"
               step="0.01"
               required
             />
             <div className="space-y-2">
               <Label htmlFor="eventType" className="text-sm font-medium">
                 Event Type *
               </Label>
               <NativeSelect
                 id="eventType"
                 value={formData.eventType}
                 onChange={(e) => handleInputChange('eventType', e.target.value)}
                 placeholder="Select event type"
                 required
               >
                 <option value="regular">Regular</option>
                 <option value="special">Special</option>
                 <option value="championship">Championship</option>
                 <option value="exhibition">Exhibition</option>
               </NativeSelect>
             </div>
           </div>

           {/* Cock Requirements and Max Participants */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <InputField
               id="noCockRequirements"
               label="Cock Requirements *"
               icon={UsersIcon}
               type="number"
               value={formData.noCockRequirements}
               onChange={(e) => handleInputChange('noCockRequirements', e.target.value)}
               placeholder="Enter number of cocks required"
               min="1"
               max="1000"
               required
             />
             <InputField
               id="maxParticipants"
               label="Max Participants"
               icon={Users}
               type="number"
               value={formData.maxParticipants}
               onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
               placeholder="Enter max participants (optional)"
               min="1"
             />
           </div>

                       {/* Public Toggle */}
            <div className="space-y-2">
              <Label htmlFor="isPublic" className="text-sm font-medium">
                Public Event
              </Label>
              <NativeSelect
                id="isPublic"
                value={formData.isPublic.toString()}
                onChange={(e) => handleInputChange('isPublic', e.target.value === 'true')}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </NativeSelect>
            </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter event description (optional)"
              rows={3}
            />
          </div>
        </div>
      </CustomAlertDialog>

      {/* Edit Event Dialog */}
      <CustomAlertDialog
        open={editEventDialogOpen}
        onOpenChange={setEditEventDialogOpen}
        title="Edit Event"
        description="Update event information and details."
        maxHeight="max-h-[90vh]"
        actions={
          <>
            <Button variant="outline" onClick={handleEditDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleEditEvent} disabled={updateEventMutation.isPending}>
              {updateEventMutation.isPending ? 'Updating...' : 'Update Event'}
            </Button>
          </>
        }
      >
                 <div className="space-y-6 overflow-y-auto pr-2">
           {/* Event Name */}
           <InputField
             id="editEventName"
             label="Event Name *"
             icon={FileText}
             value={editFormData.eventName}
             onChange={(e) => handleEditInputChange('eventName', e.target.value)}
             placeholder="Enter event name"
             required
           />

                       {/* Location */}
            <InputField
              id="editLocation"
              label="Location *"
              icon={MapPin}
              value={editFormData.location}
              onChange={(e) => handleEditInputChange('location', e.target.value)}
              placeholder="Enter event location"
              required
            />

                        {/* Date and Time */}
            <InputField
              id="editDate"
              label="Date & Time *"
              icon={Calendar}
              type="datetime-local"
              value={editFormData.date}
              onChange={(e) => handleEditInputChange('date', e.target.value)}
              required
            />

            {/* Registration Deadline */}
            <InputField
              id="editRegistrationDeadline"
              label="Registration Deadline"
              icon={Clock}
              type="datetime-local"
              value={editFormData.registrationDeadline}
              onChange={(e) => handleEditInputChange('registrationDeadline', e.target.value)}
            />

            {/* Prize and Entry Fee */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <InputField
               id="editPrize"
               label="Prize Pool (PHP) *"
               icon={DollarSign}
               type="number"
               value={editFormData.prize}
               onChange={(e) => handleEditInputChange('prize', e.target.value)}
               placeholder="Enter prize amount"
               min="0"
               step="0.01"
               required
             />
             <InputField
               id="editEntryFee"
               label="Entry Fee (PHP) *"
               icon={DollarSign}
               type="number"
               value={editFormData.entryFee}
               onChange={(e) => handleEditInputChange('entryFee', e.target.value)}
               placeholder="Enter entry fee"
               min="0"
               step="0.01"
               required
             />
           </div>

           {/* Minimum Bet and Event Type */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <InputField
               id="editMinimumBet"
               label="Minimum Bet (PHP) *"
               icon={Hash}
               type="number"
               value={editFormData.minimumBet}
               onChange={(e) => handleEditInputChange('minimumBet', e.target.value)}
               placeholder="Enter minimum bet"
               min="0"
               step="0.01"
               required
             />
             <div className="space-y-2">
               <Label htmlFor="editEventType" className="text-sm font-medium">
                 Event Type *
               </Label>
               <NativeSelect
                 id="editEventType"
                 value={editFormData.eventType}
                 onChange={(e) => handleEditInputChange('eventType', e.target.value)}
                 placeholder="Select event type"
                 required
               >
                 <option value="regular">Regular</option>
                 <option value="special">Special</option>
                 <option value="championship">Championship</option>
                 <option value="exhibition">Exhibition</option>
               </NativeSelect>
             </div>
           </div>

           {/* Cock Requirements and Max Participants */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <InputField
               id="editNoCockRequirements"
               label="Cock Requirements *"
               icon={UsersIcon}
               type="number"
               value={editFormData.noCockRequirements}
               onChange={(e) => handleEditInputChange('noCockRequirements', e.target.value)}
               placeholder="Enter number of cocks required"
               min="1"
               max="1000"
               required
             />
             <InputField
               id="editMaxParticipants"
               label="Max Participants"
               icon={Users}
               type="number"
               value={editFormData.maxParticipants}
               onChange={(e) => handleEditInputChange('maxParticipants', e.target.value)}
               placeholder="Enter max participants (optional)"
               min="1"
             />
           </div>

                       {/* Public Toggle */}
            <div className="space-y-2">
              <Label htmlFor="editIsPublic" className="text-sm font-medium">
                Public Event
              </Label>
              <NativeSelect
                id="editIsPublic"
                value={editFormData.isPublic.toString()}
                onChange={(e) => handleEditInputChange('isPublic', e.target.value === 'true')}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </NativeSelect>
            </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="editDescription" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="editDescription"
              value={editFormData.description}
              onChange={(e) => handleEditInputChange('description', e.target.value)}
              placeholder="Enter event description (optional)"
              rows={3}
            />
          </div>
        </div>
      </CustomAlertDialog>

      {/* Delete Event Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteEventDialogOpen}
        onOpenChange={setDeleteEventDialogOpen}
        title="Delete Event"
        description={`Are you sure you want to delete "${selectedEvent?.eventName}"? This action cannot be undone.`}
        confirmText="Delete Event"
        onConfirm={handleDeleteEvent}
        onCancel={() => {
          setDeleteEventDialogOpen(false)
          setSelectedEvent(null)
        }}
        variant="destructive"
        loading={deleteEventMutation.isPending}
      />

      {/* Data Table */}
      <DataTable
        data={events}
        columns={columns}
        pageSize={10}
        searchable={true}
        filterable={true}
        title="Events"
        onRowClick={handleRowClick}
        loading={isLoading}
        emptyMessage="No events found"
        className="shadow-sm"
      />
    </PageLayout>
  )
}

export default Events
