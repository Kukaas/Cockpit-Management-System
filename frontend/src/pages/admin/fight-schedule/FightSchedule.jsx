import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { useGetById, useGetAll } from '@/hooks/useApiQueries'

// Import custom components
import EventDetailsCard from './components/EventDetailsCard'
import AdminFightTabs from './components/FightTabs'
import DetailsDialog from './components/DetailsDialog'
import ChampionshipTab from './components/ChampionshipTab'
import FastestKillWinnersTab from './components/FastestKillWinnersTab'
import { createFightColumns, createMatchResultColumns } from './components/TableColumns'

const AdminFightSchedule = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()

  // State management
  const [activeTab, setActiveTab] = useState('fights')
  const [selectedItem, setSelectedItem] = useState(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useGetById('/events', eventId)

  // Fetch fight schedules for this event
  const { data: fightsData = [] } = useGetAll(`/fight-schedules/event/${eventId}`)

  // Fetch match results for this event
  const { data: resultsData = [] } = useGetAll(`/match-results/event/${eventId}`)

  // Calculate total plazada for this event from match results
  const totalPlazada = resultsData?.reduce((sum, result) => sum + (result.totalPlazada || 0), 0) || 0

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
  const handleViewDetails = (item, type) => {
    setSelectedItem({ ...item, type })
    setDetailDialogOpen(true)
  }

  // Create table columns (view-only)
  const fightColumns = createFightColumns(formatCurrency, formatDate, handleViewDetails, event?.eventType)
  const resultColumns = createMatchResultColumns(formatCurrency, formatDate, handleViewDetails, event?.eventType)

  if (eventLoading) {
    return (
      <PageLayout title="Loading..." description="Loading event details...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </PageLayout>
    )
  }

  if (!event) {
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
      title={`Fight Schedule - ${event.eventName}`}
      description="View fight schedules and match results for this event"
      headerButton={
        <Button variant="outline" onClick={() => navigate('/admin/fight-schedule')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      }
    >
      {/* Event Details Card */}
      <EventDetailsCard
        event={event}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        totalPlazada={totalPlazada}
      />

      {/* Fight and Results Tabs */}
      <AdminFightTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fights={fightsData}
        results={resultsData}
        fightColumns={fightColumns}
        resultColumns={resultColumns}
        eventType={event.eventType}
      />

      {/* Championship Tab Content for Derby and Hits Ulutan Events */}
      {(event.eventType === 'derby' || event.eventType === 'hits_ulutan') && activeTab === 'championship' && (
        <ChampionshipTab
          eventId={eventId}
          eventType={event.eventType}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Fastest Kill Winners Tab Content for Fastest Kill Events */}
      {event.eventType === 'fastest_kill' && activeTab === 'fastest-kill' && (
        <FastestKillWinnersTab
          eventId={eventId}
          eventType={event.eventType}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Detail View Dialog */}
      <DetailsDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        selectedItem={selectedItem}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        event={event}
      />
    </PageLayout>
  )
}

export default AdminFightSchedule
