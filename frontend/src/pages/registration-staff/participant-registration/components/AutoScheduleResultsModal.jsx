import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const AutoScheduleResultsModal = ({
    open,
    onOpenChange,
    isLoading,
    results,
    event
}) => {
    const { created = 0, fights = [], unmatched = [] } = results || {}

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                Auto-Scheduling Fights...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                Auto-Schedule Complete
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {isLoading
                            ? 'Please wait while we match chickens and create fight schedules...'
                            : `Successfully scheduled ${created} fight${created !== 1 ? 's' : ''}`
                        }
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        <p className="text-sm text-muted-foreground">Analyzing weights and matching chickens...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <p className="text-sm font-medium text-green-900">Fights Created</p>
                                </div>
                                <p className="text-2xl font-bold text-green-700">{created}</p>
                            </div>
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle className="h-4 w-4 text-orange-600" />
                                    <p className="text-sm font-medium text-orange-900">Unmatched</p>
                                </div>
                                <p className="text-2xl font-bold text-orange-700">{unmatched.length}</p>
                            </div>
                        </div>

                        {/* Created Fights */}
                        {fights.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    Scheduled Fights ({fights.length})
                                </h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {fights.map((fight, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="outline" className="font-mono">
                                                            Fight #{fight.fightNumber}
                                                        </Badge>
                                                        <div className="text-sm">
                                                            <span className="font-medium">Entry #{fight.cockProfileID[0]?.entryNo || 'N/A'}</span>
                                                            <span className="text-muted-foreground mx-2">vs</span>
                                                            <span className="font-medium">Entry #{fight.cockProfileID[1]?.entryNo || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    {event?.eventType === 'derby' && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {fight.cockProfileID[0]?.weight || 'N/A'}g vs {fight.cockProfileID[1]?.weight || 'N/A'}g
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Red Preview Box */}
                                            <div className="p-3 bg-red-600 rounded-md text-center">
                                                <p className="text-white text-sm font-semibold">
                                                    {event?.eventType === 'derby' ? (
                                                        <>fight#{fight.fightNumber} entry#{fight.cockProfileID[0]?.entryNo || 'N/A'} {fight.participantsID[0]?.entryName || 'N/A'} VS entry#{fight.cockProfileID[1]?.entryNo || 'N/A'} {fight.participantsID[1]?.entryName || 'N/A'}</>
                                                    ) : (
                                                        <>fight#{fight.fightNumber} entry#{fight.cockProfileID[0]?.entryNo || 'N/A'} {fight.participantsID[0]?.participantName || 'N/A'} VS entry#{fight.cockProfileID[1]?.entryNo || 'N/A'} {fight.participantsID[1]?.participantName || 'N/A'}</>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Unmatched Chickens */}
                        {unmatched.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-orange-600" />
                                    Unmatched Chickens ({unmatched.length})
                                </h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {unmatched.map((chicken, index) => (
                                        <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="font-mono">
                                                        Entry #{chicken.entryNo}
                                                    </Badge>
                                                    <div className="text-sm">
                                                        <span className="font-medium">{chicken.weight}g</span>
                                                        {chicken.entryName && (
                                                            <span className="text-muted-foreground ml-2">({chicken.entryName})</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-orange-700 italic">
                                                    {chicken.reason}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button onClick={() => onOpenChange(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default AutoScheduleResultsModal
