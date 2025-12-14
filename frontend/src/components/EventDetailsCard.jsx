import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Users, Clock, Award, AlertTriangle } from 'lucide-react'
import api from '@/services/api'

const EventDetailsCard = ({ event, formatDate, formatCurrency, showCapacity = false }) => {
    const [capacityStatus, setCapacityStatus] = useState(null)
    const [loadingCapacity, setLoadingCapacity] = useState(true)

    // Fetch capacity status (only if showCapacity is true)
    useEffect(() => {
        const fetchCapacityStatus = async () => {
            if (!showCapacity) {
                setLoadingCapacity(false)
                return
            }

            try {
                setLoadingCapacity(true)
                const response = await api.get(`/entrances/capacity/${event._id}`)
                setCapacityStatus(response.data.data)
            } catch (error) {
                console.error('Error fetching capacity status:', error)
            } finally {
                setLoadingCapacity(false)
            }
        }

        if (event._id) {
            fetchCapacityStatus()
        }
    }, [event._id, showCapacity])

    // Helper function to get badge variant based on event type
    const getEventTypeBadgeVariant = (eventType) => {
        switch (eventType) {
            case 'derby':
            case 'hits_ulutan':
                return 'default'
            case 'fastest_kill':
                return 'secondary'
            case 'regular':
            default:
                return 'outline'
        }
    }

    // Helper function to get event type icon
    const getEventTypeIcon = (eventType) => {
        switch (eventType) {
            case 'derby':
            case 'hits_ulutan':
            case 'fastest_kill':
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
            case 'hits_ulutan':
                return 'Hits Ulutan event'
            case 'fastest_kill':
                return 'Fastest Kill event with time-based competition'
            case 'regular':
            default:
                return 'Standard regular event'
        }
    }

    // Helper function to get capacity status color
    const getCapacityStatusColor = () => {
        if (!capacityStatus) return 'text-gray-600'
        if (capacityStatus.isAtCapacity) return 'text-red-600'
        if (capacityStatus.capacityPercentage >= 80) return 'text-orange-600'
        return 'text-green-600'
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Event Details
                </CardTitle>
                <CardDescription>
                    {getEventTypeDescription(event.eventType)} - Event information and requirements
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Event Name</p>
                        <p className="font-medium">{event.eventName}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                        <p className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDate(event.date)}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Minimum Bet</p>
                        <p className="flex items-center gap-1">{formatCurrency(event.minimumBet || 0)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Minimum Participants</p>
                        <p className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.minimumParticipants || 0}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Entrance Fee</p>
                        <p className="flex items-center gap-1">{formatCurrency(event.entranceFee)} per person</p>
                    </div>
                    {showCapacity && (
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Current Entrances</p>
                            <p className={`flex items-center gap-1 ${getCapacityStatusColor()}`}>
                                <Users className="h-4 w-4" />
                                {loadingCapacity ? (
                                    <span className="text-sm">Loading...</span>
                                ) : capacityStatus ? (
                                    <span>
                                        {capacityStatus.currentTotal}
                                    </span>
                                ) : (
                                    <span>N/A</span>
                                )}
                            </p>
                        </div>
                    )}
                </div>

                {/* Capacity Warning */}
                {showCapacity && capacityStatus && capacityStatus.isAtCapacity && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <p className="text-sm font-medium text-red-800">
                                Maximum capacity reached! No more entrances can be recorded for this event.
                            </p>
                        </div>
                    </div>
                )}

                {showCapacity && capacityStatus && !capacityStatus.isAtCapacity && capacityStatus.capacityPercentage >= 80 && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            <p className="text-sm font-medium text-orange-800">
                                Capacity is {capacityStatus.capacityPercentage}% full. Only {capacityStatus.remainingCapacity} more entrances can be recorded.
                            </p>
                        </div>
                    </div>
                )}

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
                                {event.eventType === 'fastest_kill' ? 'Fastest Kill' : event.eventType === 'hits_ulutan' ? 'Hits Ulutan' : event.eventType}
                            </Badge>
                        </div>
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
                            <p className="flex items-center gap-1">{formatCurrency(event.prize)}
                            </p>
                        </div>
                    )}

                    {/* Show Derby Weight Range */}
                    {event.eventType === 'derby' && event.minWeight && event.maxWeight && (
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Weight Range</p>
                            <p className="flex items-center gap-1">{event.minWeight}-{event.maxWeight} g</p>
                        </div>
                    )}

                    {event.eventType === 'derby' && event.weightGap && (
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Weight Gap</p>
                            <p className="flex items-center gap-1">±{event.weightGap} g</p>
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


                    {/* Show Prize Pool for fastest_kill events */}
                    {event.eventType === 'fastest_kill' && event.prize && (
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Prize Pool</p>
                            <p className="flex items-center gap-1">{formatCurrency(event.prize)}
                            </p>
                        </div>
                    )}

                    {/* Entry Fee - Optional */}
                    {event.entryFee && event.entryFee > 0 && (
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Entry Fee</p>
                            <p className="flex items-center gap-1"> <span className="font-semibold text-blue-700">{formatCurrency(event.entryFee)}</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Prize Distribution for Fastest Kill Events */}
                {event.eventType === 'fastest_kill' && event.prizeDistribution && event.prizeDistribution.length > 0 && (
                    <>
                        <Separator className="my-4" />
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-purple-600" />
                                <h3 className="text-lg font-semibold">Prize Distribution</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {event.prizeDistribution.map((tier, index) => {
                                    const tierPrizePool = event.prize * (tier.percentage / 100)
                                    const winnersInTier = tier.endRank - tier.startRank + 1
                                    const prizePerWinner = tierPrizePool / winnersInTier

                                    // Determine color based on percentage
                                    const colorClass = tier.percentage >= 50 ? 'green' :
                                        tier.percentage >= 20 ? 'blue' :
                                            tier.percentage > 0 ? 'purple' : 'gray'

                                    return (
                                        <div key={index} className={`flex items-center gap-3 p-3 bg-${colorClass}-50 rounded-lg border border-${colorClass}-200`}>
                                            <div className={`w-12 h-12 bg-${colorClass}-500 rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                                                {tier.percentage}%
                                            </div>
                                            <div className="flex-1">
                                                <div className={`font-semibold text-${colorClass}-900`}>{tier.tierName}</div>
                                                <div className={`text-xs text-${colorClass}-700`}>
                                                    {tier.startRank === tier.endRank
                                                        ? `Top ${tier.startRank}`
                                                        : `Top ${tier.startRank}-${tier.endRank}`
                                                    } ({winnersInTier} {winnersInTier === 1 ? 'winner' : 'winners'})
                                                </div>
                                                <div className={`text-xs text-${colorClass}-600 mt-1 font-medium`}>
                                                    {formatCurrency(prizePerWinner)} per winner
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default EventDetailsCard
