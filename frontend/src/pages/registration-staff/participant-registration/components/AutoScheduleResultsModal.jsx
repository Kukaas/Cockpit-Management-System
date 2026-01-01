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
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fights Created</p>
                                <p className="text-2xl font-black text-slate-900">{created}</p>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Unmatched</p>
                                <p className="text-2xl font-black text-orange-600">{unmatched.length}</p>
                            </div>
                        </div>

                        {/* Created Fights */}
                        {fights.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    Scheduled Matchups
                                </h3>
                                <div className="space-y-1.5">
                                    {fights.map((fight, index) => {
                                        const p1 = fight.participantsID[0];
                                        const p2 = fight.participantsID[1];
                                        const name1 = event?.eventType === 'derby' ? p1?.entryName : p1?.participantName;
                                        const name2 = event?.eventType === 'derby' ? p2?.entryName : p2?.participantName;

                                        return (
                                            <div key={index} className="p-3 bg-white border border-slate-100 rounded-lg hover:border-slate-200 transition-all group">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                                                            {fight.fightNumber}
                                                        </span>
                                                        <p className="text-sm font-semibold text-slate-700 uppercase tracking-tight break-words">
                                                            entry#{fight.cockProfileID[0]?.entryNo} {name1}
                                                            <span className="mx-2 text-slate-300 font-bold whitespace-nowrap">VS</span>
                                                            entry#{fight.cockProfileID[1]?.entryNo} {name2}
                                                        </p>
                                                    </div>
                                                    {event?.eventType === 'derby' && (
                                                        <div className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                                                            {fight.cockProfileID[0]?.weight}g / {fight.cockProfileID[1]?.weight}g
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Unmatched Chickens */}
                        {unmatched.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-orange-600" />
                                    Unmatched Chickens
                                </h3>
                                <div className="space-y-1.5">
                                    {unmatched.map((chicken, index) => (
                                        <div key={index} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded shrink-0">
                                                    #{chicken.entryNo}
                                                </span>
                                                <span className="text-sm font-semibold text-slate-700 break-words">
                                                    {chicken.weight}g {chicken.entryName && <span className="text-slate-400 font-normal ml-1">({chicken.entryName})</span>}
                                                </span>
                                            </div>
                                            <span className="text-[9px] font-bold text-orange-600 uppercase bg-orange-100/50 px-2 py-0.5 rounded-full shrink-0">
                                                {chicken.reason}
                                            </span>
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
