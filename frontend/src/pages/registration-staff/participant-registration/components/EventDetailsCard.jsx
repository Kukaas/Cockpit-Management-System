import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, MapPin, DollarSign, Users, Clock, Award, Building } from 'lucide-react'

const EventDetailsCard = ({ event, formatDate, formatCurrency }) => {
  // Helper function to get badge variant based on event type
  const getEventTypeBadgeVariant = (eventType) => {
    switch (eventType) {
      case 'derby':
        return 'default'
      case 'regular':
      default:
        return 'outline'
    }
  }

  // Helper function to get event type icon
  const getEventTypeIcon = (eventType) => {
    switch (eventType) {
      case 'derby':
        return <Award className="h-4 w-4" />
      case 'regular':
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  // Helper function to get event type description
  const getEventTypeDescription = (eventType) => {
    switch (eventType) {
      case 'derby':
        return 'Derby event with prizes and specific requirements'
      case 'regular':
      default:
        return 'Standard regular event'
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Event Details
        </CardTitle>
        <CardDescription>
          {getEventTypeDescription(event.eventType)} - Participant registration and management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Event Name</p>
            <p className="font-medium">{event.eventName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Location</p>
            <p className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.location}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
            <p className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDate(event.date)}
            </p>
          </div>
          {/* <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Max Capacity</p>
            <p className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              {event.maxCapacity} people
            </p>
          </div> */}
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Event Type with proper styling */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Event Type</p>
            <div className="flex items-center gap-2">
              {getEventTypeIcon(event.eventType)}
              <Badge
                variant={getEventTypeBadgeVariant(event.eventType)}
                className="capitalize"
              >
                {event.eventType}
              </Badge>
            </div>
          </div>

          {/* Event Status */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge
              variant={
                event.status === 'active' ? 'default' :
                event.status === 'completed' ? 'secondary' :
                event.status === 'cancelled' ? 'destructive' : 'outline'
              }
              className="capitalize"
            >
              {event.status}
            </Badge>
          </div>

          {/* Show Cock Requirements only for derby events */}
          {event.eventType === 'derby' && event.noCockRequirements && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Cock Requirements</p>
              <p className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {event.noCockRequirements} cocks
              </p>
            </div>
          )}

          {/* Show Prize Pool for derby events */}
          {event.eventType === 'derby' && event.prize && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Prize Pool</p>
              <p className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                {formatCurrency(event.prize)}
              </p>
            </div>
          )}

          {/* Show Max Participants for derby events */}
          {event.eventType === 'derby' && event.maxParticipants && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Max Participants</p>
              <p className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {event.maxParticipants} participants
              </p>
            </div>
          )}

          {/* Show Registration Deadline for derby events */}
          {event.eventType === 'derby' && event.registrationDeadline && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Registration Deadline</p>
              <p className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDate(event.registrationDeadline)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default EventDetailsCard
