import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, MapPin, DollarSign, Users, Clock } from 'lucide-react'

const EventDetailsCard = ({ event, formatDate, formatCurrency }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Event Details
        </CardTitle>
        <CardDescription>Current event information and requirements</CardDescription>
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
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Entry Fee</p>
            <p className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {formatCurrency(event.entryFee)}
            </p>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Cock Requirements</p>
            <p className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {event.noCockRequirements} cocks
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Prize Pool</p>
            <p className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              {formatCurrency(event.prize)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Event Type</p>
            <Badge variant="outline" className="capitalize">
              {event.eventType}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default EventDetailsCard
