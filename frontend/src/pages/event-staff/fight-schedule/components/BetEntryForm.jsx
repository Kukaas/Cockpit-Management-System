import React from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'

const BetEntryForm = ({
    open,
    onOpenChange,
    title,
    description,
    formData,
    onInputChange,
    onSubmit,
    onCancel,
    isPending,
    selectedFight,
    isEdit = false,
    event
}) => {
    // Get participants from selected fight
    const participants = selectedFight?.participantsID || []
    const participantBets = formData.participantBets || []

    // Calculate betting information preview
    const calculateBettingPreview = () => {
        if (participantBets.length !== 2) return null

        const [bet1, bet2] = participantBets

        // Check if both bets have valid amounts
        const bet1Amount = bet1.betAmount === '' ? null : (bet1.betAmount || 0)
        const bet2Amount = bet2.betAmount === '' ? null : (bet2.betAmount || 0)

        if (bet1Amount === null || bet2Amount === null) return null

        // Determine Meron and Wala based on bet amounts
        let meronBet, walaBet
        if (bet1.position === 'Meron' || bet2.position === 'Meron') {
            meronBet = bet1.position === 'Meron' ? bet1 : bet2
            walaBet = bet1.position === 'Meron' ? bet2 : bet1
        } else if (bet1Amount > bet2Amount) {
            meronBet = bet1
            walaBet = bet2
        } else {
            meronBet = bet2
            walaBet = bet1
        }

        const gap = Math.max(0, (meronBet.betAmount || 0) - (walaBet.betAmount || 0))
        const totalBetPool = (meronBet.betAmount || 0) + (walaBet.betAmount || 0) + gap

        return {
            meronBet,
            walaBet,
            gap,
            totalBetPool
        }
    }

    const bettingPreview = calculateBettingPreview()

    const handleSubmit = () => {
        // Check if any bet is below minimum
        if (event?.minimumBet) {
            const hasInvalidBet = participants.some(participant => {
                const bet = participantBets.find(b => {
                    const betId = b?.participantID?._id || b?.participantID
                    const pId = participant._id
                    return betId === pId || betId?.toString() === pId?.toString()
                })
                return bet && bet.betAmount !== '' && Number(bet.betAmount) < event.minimumBet
            })

            if (hasInvalidBet) {
                toast.error(`All bets must meet the minimum bet requirement of ₱${event.minimumBet.toLocaleString()}`)
                return;
            }
        }

        onSubmit()
    }

    return (
        <CustomAlertDialog
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
            maxHeight="max-h-[90vh]"
            actions={
                <>
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? (isEdit ? 'Updating...' : 'Recording...') : (isEdit ? 'Update Bet' : 'Record Bet')}
                    </Button>
                </>
            }
        >
            <div className="space-y-6 overflow-y-auto pr-2">
                {/* Fight Information */}
                {selectedFight && (
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">#</span>
                            </div>
                            <h4 className="font-semibold text-lg text-gray-900">Fight Information</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="font-medium text-gray-700">Fight Details</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Fight Number:</span>
                                        <span className="font-semibold text-blue-600">#{selectedFight.fightNumber}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Status:</span>
                                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                            {selectedFight.status?.replace('_', ' ').charAt(0).toUpperCase() + selectedFight.status?.replace('_', ' ').slice(1) || 'Scheduled'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="font-medium text-gray-700">Participants</span>
                                </div>
                                <div className="space-y-2">
                                    {participants.map((participant, index) => (
                                        <div key={participant._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                                            <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                                {index + 1}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{participant.participantName}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Participant Bets */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium">Participant Bets</h4>
                    </div>
                    {participants.map((participant) => {
                        // Find bet by participantID
                        const participantBet = participantBets.find(bet => {
                            const betParticipantId = bet?.participantID?._id || bet?.participantID
                            const participantId = participant._id
                            return betParticipantId === participantId || betParticipantId?.toString() === participantId?.toString()
                        })

                        // Get position for this participant
                        const position = (() => {
                            if (!participantBet || participantBets.length !== 2) return null
                            const otherBet = participantBets.find(bet => {
                                const betParticipantId = bet?.participantID?._id || bet?.participantID
                                return betParticipantId !== participant._id && betParticipantId?.toString() !== participant._id?.toString()
                            })
                            if (!otherBet) return null

                            const betAmount1 = participantBet.betAmount === '' ? null : (participantBet.betAmount || 0)
                            const betAmount2 = otherBet.betAmount === '' ? null : (otherBet.betAmount || 0)

                            if (betAmount1 === null || betAmount2 === null) return null

                            if (betAmount1 > betAmount2) return 'Meron'
                            if (betAmount1 < betAmount2) return 'Wala'
                            return participantBet.position || null
                        })()

                        return (
                            <div key={participant._id} className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    {participant.participantName} Bet Amount *
                                    {position && (
                                        <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${position === 'Meron' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {position}
                                        </span>
                                    )}
                                </Label>
                                <InputField
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={participantBet?.betAmount ?? ''}
                                    onChange={(e) => {
                                        const newBets = [...participantBets]
                                        const existingBetIndex = newBets.findIndex(bet => {
                                            const betParticipantId = bet?.participantID?._id || bet?.participantID
                                            const participantId = participant._id
                                            return betParticipantId === participantId || betParticipantId?.toString() === participantId?.toString()
                                        })

                                        const inputValue = e.target.value
                                        const newBetAmount = inputValue === '' ? '' : (parseFloat(inputValue) || 0)
                                        const betData = {
                                            participantID: participant._id,
                                            betAmount: newBetAmount,
                                            position: participantBet?.position
                                        }

                                        if (existingBetIndex >= 0) {
                                            newBets[existingBetIndex] = betData
                                        } else {
                                            newBets.push(betData)
                                        }

                                        // Recalculate positions based on bet amounts
                                        const validBets = newBets.filter(bet => bet.betAmount !== '' && bet.betAmount > 0)
                                        if (validBets.length === 2) {
                                            const [bet1, bet2] = validBets
                                            if (bet1.betAmount > bet2.betAmount) {
                                                bet1.position = 'Meron'
                                                bet2.position = 'Wala'
                                            } else if (bet2.betAmount > bet1.betAmount) {
                                                bet2.position = 'Meron'
                                                bet1.position = 'Wala'
                                            } else {
                                                bet1.position = undefined
                                                bet2.position = undefined
                                            }
                                            newBets.forEach(bet => {
                                                const validBet = validBets.find(vb => {
                                                    const betId = bet?.participantID?._id || bet?.participantID
                                                    const validBetId = vb?.participantID?._id || vb?.participantID
                                                    return betId === validBetId || betId?.toString() === validBetId?.toString()
                                                })
                                                if (validBet) {
                                                    bet.position = validBet.position
                                                } else {
                                                    bet.position = undefined
                                                }
                                            })
                                        } else {
                                            newBets.forEach(bet => {
                                                bet.position = undefined
                                            })
                                        }

                                        onInputChange('participantBets', newBets)
                                    }}
                                    placeholder="Enter bet amount"
                                    required
                                />
                                {participantBet?.betAmount !== undefined && participantBet.betAmount !== '' && event?.minimumBet && participantBet.betAmount < event.minimumBet && (
                                    <div className="text-xs text-red-600 flex items-center gap-1 mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <span>Must meet the minimum bet (₱{event.minimumBet.toLocaleString()})</span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Betting Preview */}
                {bettingPreview && (
                    <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                <span className="text-emerald-600 font-semibold text-sm">₱</span>
                            </div>
                            <h5 className="font-semibold text-lg text-gray-900">Betting Preview</h5>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-emerald-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-red-50 rounded-lg">
                                    <div className="text-xs text-gray-500 mb-1">Meron Bet</div>
                                    <div className="font-semibold text-red-700">₱{bettingPreview.meronBet.betAmount?.toLocaleString()}</div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        {participants.find(p => p._id === bettingPreview.meronBet.participantID)?.participantName}
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <div className="text-xs text-gray-500 mb-1">Wala Bet</div>
                                    <div className="font-semibold text-blue-700">₱{bettingPreview.walaBet.betAmount?.toLocaleString()}</div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        {participants.find(p => p._id === bettingPreview.walaBet.participantID)?.participantName}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CustomAlertDialog>
    )
}

export default BetEntryForm
