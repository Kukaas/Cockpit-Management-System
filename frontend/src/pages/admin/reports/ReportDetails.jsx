import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { useGetById } from '@/hooks/useApiQueries'
import EventDetailsCard from '@/components/EventDetailsCard'
import ReportTabs from './components/ReportTabs'

import UnifiedPrintButton from './components/UnifiedPrintButton'

const ReportDetails = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()

  // State management
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [activeTab, setActiveTab] = useState('rentals')

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useGetById('/events', eventId)

  // Update state when data changes
  useEffect(() => {
    if (event && event._id && (!selectedEvent || selectedEvent._id !== event._id)) {
      setSelectedEvent(event)
    }
  }, [event, selectedEvent])

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
      title={`Reports - ${selectedEvent.eventName}`}
      description="View financial reports for this event"
      headerButton={
        <div className="flex gap-2">
          <UnifiedPrintButton
            event={selectedEvent}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
          <Button variant="outline" onClick={() => navigate('/admin/reports')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
      }
    >
      {/* Event Details Card */}
      <EventDetailsCard
        event={selectedEvent}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />

      {/* Report Tabs */}
      <ReportTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        event={selectedEvent}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    </PageLayout>
  )
}

export default ReportDetails

