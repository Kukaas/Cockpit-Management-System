import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { useGetById, useGetAll } from '@/hooks/useApiQueries'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import DataTable from '@/components/custom/DataTable'

// Import custom components
import EventDetailsCard from '../../entrance-staff/entrance-registration/components/EventDetailsCard'
import { createViewOnlyRentalColumns } from './components/ViewOnlyRentalColumns'
import DetailsDialog from '@/pages/tangkal-staff/rentals/components/DetailsDialog'

const EventRentals = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()

  // State management
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useGetById('/events', eventId)

  // Fetch rentals for this specific event
  const { data: rentalsData = [] } = useGetAll(`/cage-rentals/event/${eventId}`)

  // Update state when data changes
  useEffect(() => {
    if (event && event._id && (!selectedEvent || selectedEvent._id !== event._id)) {
      setSelectedEvent(event)
    }
  }, [event, selectedEvent])

  // Use the API data directly
  const rentals = rentalsData || []

  // Format functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  // Handle view details
  const handleViewDetails = (rental) => {
    setSelectedItem(rental)
    setDetailDialogOpen(true)
  }



  // Create table columns
  const rentalColumns = createViewOnlyRentalColumns(
    formatCurrency,
    formatDate,
    handleViewDetails
  )

  if (eventLoading) {
    return (
      <PageLayout title="Loading..." description="Loading event details...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </PageLayout>
    )
  }

  if (!selectedEvent) {
    return (
      <PageLayout title="Event Not Found" description="The requested event could not be found.">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Event not found</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={`Event Rentals - ${selectedEvent.eventName}`}
      description="View cage rentals for this specific event"
      headerButton={
        <Button variant="outline" onClick={() => navigate('/admin/tangkal')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Event Selection
        </Button>
      }
    >
      {/* Event Details Card */}
      <EventDetailsCard
        event={selectedEvent}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />

      {/* Rentals Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Cage Rentals</h3>
          <div className="text-sm text-muted-foreground">
            {rentals.length} rental{rentals.length !== 1 ? 's' : ''} found
          </div>
        </div>

        <DataTable
          data={rentals}
          columns={rentalColumns}
          pageSize={10}
          searchable={true}
          filterable={true}
          title="Cage Rentals"
          loading={false}
          emptyMessage="No cage rentals found for this event"
          className="shadow-sm"
        />
      </div>

      {/* Detail View Dialog */}
      <DetailsDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        selectedItem={selectedItem}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />
    </PageLayout>
  )
}

export default EventRentals
