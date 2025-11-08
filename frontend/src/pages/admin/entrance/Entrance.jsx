import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Printer } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { useGetAll, useGetById } from '@/hooks/useApiQueries'
import { printEntranceReport } from '@/lib/printEntranceReport'

// Import custom components
import EventDetailsCard from './components/EventDetailsCard'
import EntranceStats from './components/EntranceStats'
import { createAdminEntranceColumns } from './components/TableColumns'
import DataTable from '@/components/custom/DataTable'

const Entrance = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()

  // State management
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useGetById('/events', eventId)

  // Fetch entrances for this event
  const { data: entrancesData = [] } = useGetAll(`/entrances?eventID=${eventId}`)

  // Update state when data changes
  useEffect(() => {
    if (event && event._id && (!selectedEvent || selectedEvent._id !== event._id)) {
      setSelectedEvent(event)
    }
  }, [event, selectedEvent])

  // Use the API data directly instead of local state
  const entrances = entrancesData || []

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

  // Calculate total entrances and revenue
  const totalEntrances = entrances.reduce((sum, entrance) => sum + entrance.count, 0)
  const totalRevenue = totalEntrances * (selectedEvent?.entranceFee || 0) // Use dynamic entrance fee

  // Create table columns (view-only)
  const entranceColumns = createAdminEntranceColumns(formatDate, formatCurrency)

  // Print functionality
  const handlePrint = () => {
    printEntranceReport({
      event: selectedEvent,
      entrances,
      formatDate,
      formatCurrency,
      totalEntrances,
      totalRevenue
    })
  }

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
      title={`Entrance Tally - ${selectedEvent.eventName}`}
      description="View entrance tallies and records for this event"
      headerButton={
        <Button variant="outline" onClick={() => navigate('/admin/entrance')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      }
    >
      {/* Event Details Card */}
      <EventDetailsCard
        event={selectedEvent}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />

      {/* Summary Stats */}
      <EntranceStats
        totalTallyRecords={entrances.length}
        totalEntrances={totalEntrances}
        totalRevenue={totalRevenue}
        formatCurrency={formatCurrency}
        maxCapacity={selectedEvent?.maxCapacity}
      />

      {/* Entrance Records Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Entrance Tally Records ({entrances.length})</h3>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
        </div>
        <DataTable
          data={entrances}
          columns={entranceColumns}
          pageSize={10}
          searchable={true}
          filterable={true}
          title="Entrance Tally Records"
          loading={false}
          emptyMessage="No entrance tally records yet"
          className="shadow-sm"
        />
      </div>
    </PageLayout>
  )
}

export default Entrance
