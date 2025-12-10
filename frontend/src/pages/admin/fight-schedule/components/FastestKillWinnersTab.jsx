import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trophy, Award, Target, Users, Clock, Zap, Edit, Save, X } from 'lucide-react'
import { useGetAll } from '@/hooks/useApiQueries'
import { useCustomMutation } from '@/hooks/useApiMutations'
import { toast } from 'sonner'
import DataTable from '@/components/custom/DataTable'
import api from '@/services/api'

const FastestKillWinnersTab = ({ eventId, eventType, formatCurrency }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [prizePool, setPrizePool] = useState(0)
    const [prizeDistribution, setPrizeDistribution] = useState([])
    const [editingPrizes, setEditingPrizes] = useState({})
    const [isCalculating, setIsCalculating] = useState(false)

    // Fetch match results for fastest kill events
    const { data: matchResults = [], isLoading: isLoadingResults } = useGetAll(`/match-results/event/${eventId}`)

    // Fetch event details to get prize pool
    const { data: event, isLoading: isLoadingEvent } = useGetAll(`/events/${eventId}`)

    const isLoading = isLoadingResults || isLoadingEvent

    // Update mutation for prize distribution
    const updatePrizeDistributionMutation = useCustomMutation(
        async (data) => {
            const response = await api.put(`/match-results/fastest-kill/${eventId}/prize-distribution`, {
                prizeDistribution: data
            })
            return response.data
        },
        {
            successMessage: 'Prize distribution updated successfully',
            errorMessage: (error) => {
                return error?.response?.data?.message || 'Failed to update prize distribution'
            },
            queryKey: ['match-results', 'event', eventId],
            onSuccess: () => {
                // Refetch data after successful update
                // The query will be invalidated automatically
            }
        }
    )

    // Initialize prize pool from event
    useEffect(() => {
        if (event?.prize) {
            setPrizePool(event.prize)
        }
    }, [event])

    // Calculate and save prize distribution when results change
    useEffect(() => {
        if (matchResults.length > 0 && prizePool > 0) {
            setIsCalculating(true)

            // Filter and sort match results by fastest time
            const fastestKillResults = matchResults
                .filter(result => result.matchTimeSeconds && result.matchTimeSeconds > 0)
                .sort((a, b) => a.matchTimeSeconds - b.matchTimeSeconds)
                .map((result, index) => ({
                    ...result,
                    position: index + 1,
                    participant: result.resultMatch?.winnerParticipantID,
                    cockProfile: result.resultMatch?.winnerCockProfileID,
                    matchTime: result.matchTimeSeconds
                }))

            if (fastestKillResults.length > 0) {
                // Calculate new prize distribution
                const newDistribution = calculatePrizeDistribution(fastestKillResults, prizePool)

                // Check if prizes need to be updated (compare with existing prizeAmount)
                const needsUpdate = newDistribution.some((result, index) => {
                    const existingPrize = matchResults[index]?.prizeAmount || 0
                    return Math.abs(result.prizeAmount - existingPrize) > 0.01 // Allow small floating point differences
                })

                // Auto-save the calculated distribution if it changed
                if (needsUpdate) {
                    const distributionData = newDistribution.map(result => ({
                        resultId: result._id,
                        prizeAmount: result.prizeAmount
                    }))

                    updatePrizeDistributionMutation.mutate(distributionData)
                }

                setPrizeDistribution(newDistribution)
            }

            setIsCalculating(false)
        }
    }, [matchResults, prizePool, event])

    // Calculate prize distribution based on position and event's prize distribution tiers
    const calculatePrizeDistribution = (results, totalPrize) => {
        const distribution = []

        // Get prize distribution tiers from event
        const tiers = event?.prizeDistribution || []

        // Fallback to default if no tiers defined
        if (tiers.length === 0) {
            // Default: Top 1-10: 80%, Top 11-20: 20%
            tiers.push(
                { tierName: 'Top 1-10', startRank: 1, endRank: 10, percentage: 80 },
                { tierName: 'Top 11-20', startRank: 11, endRank: 20, percentage: 20 }
            )
        }

        results.forEach((result, index) => {
            const position = index + 1
            let prizeAmount = 0
            let tierInfo = null

            // Find which tier this position belongs to
            for (const tier of tiers) {
                if (position >= tier.startRank && position <= tier.endRank) {
                    // Calculate prize for this tier
                    const tierPrizePool = totalPrize * (tier.percentage / 100)
                    const winnersInTier = tier.endRank - tier.startRank + 1
                    prizeAmount = tierPrizePool / winnersInTier
                    tierInfo = tier
                    break
                }
            }

            distribution.push({
                ...result,
                prizeAmount: Math.max(0, prizeAmount),
                prizePercentage: totalPrize > 0 ? (prizeAmount / totalPrize * 100).toFixed(1) : 0,
                tierInfo: tierInfo
            })
        })

        return distribution
    }

    // Handle prize amount editing
    const handlePrizeEdit = (resultId, newAmount) => {
        // Allow empty string for editing, only convert to number when saving
        setEditingPrizes(prev => ({
            ...prev,
            [resultId]: newAmount
        }))
    }

    // Save prize distribution
    const handleSavePrizes = async () => {
        try {
            const updatedDistribution = prizeDistribution.map(result => {
                const editedAmount = editingPrizes[result._id]
                const prizeAmount = editedAmount !== undefined ? (parseFloat(editedAmount) || 0) : result.prizeAmount

                return {
                    resultId: result._id,
                    prizeAmount: prizeAmount
                }
            })

            // Validate total doesn't exceed prize pool
            const totalDistributed = updatedDistribution.reduce((sum, item) => sum + item.prizeAmount, 0)
            if (totalDistributed > prizePool) {
                toast.error(`Total prize distribution (${formatCurrency(totalDistributed)}) exceeds prize pool (${formatCurrency(prizePool)})`)
                return
            }

            await updatePrizeDistributionMutation.mutateAsync(updatedDistribution)

            // Update local state with recalculated percentages
            setPrizeDistribution(prev => prev.map(result => {
                const editedAmount = editingPrizes[result._id]
                const newPrizeAmount = editedAmount !== undefined ? (parseFloat(editedAmount) || 0) : result.prizeAmount
                return {
                    ...result,
                    prizeAmount: newPrizeAmount,
                    prizePercentage: prizePool > 0 ? (newPrizeAmount / prizePool * 100).toFixed(1) : 0
                }
            }))

            setEditingPrizes({})
            setIsEditing(false)
            toast.success('Prize distribution updated successfully')
        } catch (error) {
            console.error('Error saving prize distribution:', error)
        }
    }

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingPrizes({})
        setIsEditing(false)
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="text-muted-foreground">Loading fastest kill data...</p>
            </div>
        )
    }

    if (eventType !== 'fastest_kill') {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p>Fastest Kill Winners data not available for this event type.</p>
            </div>
        )
    }

    // Get the count of fastest kill results for display
    const fastestKillResultsCount = matchResults.filter(result => result.matchTimeSeconds && result.matchTimeSeconds > 0).length

    if (isCalculating) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-muted-foreground">Calculating prize distribution...</p>
            </div>
        )
    }

    if (fastestKillResultsCount === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p>No fastest kill results recorded yet.</p>
            </div>
        )
    }

    // Create table columns for fastest kill winners
    const fastestKillColumns = [
        {
            key: 'position',
            label: 'Rank',
            sortable: true,
            filterable: false,
            render: (value) => (
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${value === 1 ? 'bg-yellow-500' :
                        value === 2 ? 'bg-gray-400' :
                            value === 3 ? 'bg-amber-600' : 'bg-blue-500'
                        }`}>
                        {value}
                    </div>
                </div>
            )
        },
        {
            key: 'participant',
            label: 'Winner',
            sortable: true,
            filterable: false,
            render: (value) => (
                <div className="flex flex-col">
                    <span className="font-medium">{value?.participantName || 'N/A'}</span>
                </div>
            )
        },
        {
            key: 'matchTime',
            label: 'Time',
            sortable: true,
            filterable: false,
            render: (value) => {
                // Convert seconds to minutes and seconds
                const minutes = Math.floor(value / 60)
                const seconds = (value % 60).toFixed(2)
                const displayTime = minutes > 0
                    ? `${minutes}m ${seconds}s`
                    : `${seconds}s`
                return (
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-mono font-semibold">{displayTime}</span>
                    </div>
                )
            }
        },
        {
            key: 'tierInfo',
            label: 'Prize Tier',
            sortable: false,
            filterable: false,
            render: (value, row) => {
                if (value) {
                    // Determine color based on percentage
                    const bgColor = value.percentage >= 50 ? 'bg-green-100 text-green-800' :
                        value.percentage >= 20 ? 'bg-blue-100 text-blue-800' :
                            value.percentage > 0 ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-600'

                    return (
                        <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 ${bgColor} rounded-full text-xs font-semibold`}>
                                {value.tierName} ({value.percentage}%)
                            </div>
                        </div>
                    )
                } else {
                    return (
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                                No Prize
                            </div>
                        </div>
                    )
                }
            }
        },
        {
            key: 'prizeAmount',
            label: 'Prize Amount',
            sortable: true,
            filterable: false,
            render: (value) => (
                <span className={`font-semibold ${value > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {formatCurrency(value || 0)}
                </span>
            )
        },
    ]

    return (
        <div className="space-y-6">
            {/* Fastest Kill Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-600" />
                        Fastest Kill Winners
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{Math.min(fastestKillResultsCount, 20)}</div>
                            <div className="text-sm text-yellow-600">Prize Winners (Top 20)</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(prizePool)}</div>
                            <div className="text-sm text-green-600">Total Prize Pool</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{fastestKillResultsCount}</div>
                            <div className="text-sm text-blue-600">Total Participants</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Fastest Kill Winners Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                        Winners Leaderboard
                    </CardTitle>
                    <CardDescription>
                        Fastest kill times ranked from fastest to slowest
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={prizeDistribution}
                        columns={fastestKillColumns}
                        title="Fastest Kill Winners"
                        searchable={true}
                        filterable={false}
                        pageSize={10}
                        emptyMessage="No fastest kill results available"
                    />
                </CardContent>
            </Card>

            {/* Top 3 Winners Highlight */}
            {prizeDistribution.length >= 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-yellow-600" />
                            Top 3 Winners
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {prizeDistribution.slice(0, 3).map((winner, index) => (
                                <div key={winner._id} className={`p-4 rounded-lg border-2 ${index === 0 ? 'border-yellow-400 bg-yellow-50' :
                                    index === 1 ? 'border-gray-300 bg-gray-50' :
                                        'border-amber-400 bg-amber-50'
                                    }`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-yellow-500' :
                                            index === 1 ? 'bg-gray-400' :
                                                'bg-amber-600'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-semibold">{winner.participant?.participantName || 'N/A'}</div>
                                            <div className="text-sm text-muted-foreground">
                                                Entry #{winner.cockProfile?.entryNo || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Time:</span>
                                            <span className="font-mono font-semibold">
                                                {(() => {
                                                    const minutes = Math.floor(winner.matchTime / 60)
                                                    const seconds = (winner.matchTime % 60).toFixed(2)
                                                    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default FastestKillWinnersTab
