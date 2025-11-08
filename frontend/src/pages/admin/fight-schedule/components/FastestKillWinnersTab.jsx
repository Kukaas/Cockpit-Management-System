import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trophy, Award, Target, Users, DollarSign, Clock, Zap, Edit, Save, X } from 'lucide-react'
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

    // Calculate default prize distribution
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
                // Use prize amounts from match results
                const distribution = fastestKillResults.map((result, index) => ({
                    ...result,
                    prizeAmount: result.prizeAmount || 0,
                    prizePercentage: prizePool > 0 ? ((result.prizeAmount || 0) / prizePool * 100).toFixed(1) : 0
                }))
                setPrizeDistribution(distribution)
            }

            setIsCalculating(false)
        }
    }, [matchResults, prizePool, event])

    // Calculate prize distribution based on position
    const calculatePrizeDistribution = (results, totalPrize) => {
        const distribution = []
        let remainingPrize = totalPrize

        // Define prize tiers (you can adjust these percentages)
        const prizeTiers = [
            { positions: [1, 2], percentage: 0.30 }, // 30% for positions 1-2
            { positions: [3, 4, 5, 6], percentage: 0.20 }, // 20% for positions 3-6
            { positions: [7, 8, 9, 10], percentage: 0.15 }, // 15% for positions 7-10
            { positions: [11, 12, 13, 14, 15, 16], percentage: 0.10 }, // 10% for positions 11-16
            { positions: [17, 18, 19, 20], percentage: 0.05 }, // 5% for positions 17-20
        ]

        results.forEach((result, index) => {
            const position = index + 1
            let prizeAmount = 0

            // Find the appropriate tier for this position
            const tier = prizeTiers.find(t => t.positions.includes(position))
            if (tier) {
                const tierPrize = (totalPrize * tier.percentage) / tier.positions.length
                prizeAmount = Math.min(tierPrize, remainingPrize)
                remainingPrize -= prizeAmount
            }

            distribution.push({
                ...result,
                prizeAmount: Math.max(0, prizeAmount),
                prizePercentage: totalPrize > 0 ? (prizeAmount / totalPrize * 100).toFixed(1) : 0
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
            key: 'prizeAmount',
            label: 'Prize Amount',
            sortable: true,
            filterable: false,
            render: (value, row) => (
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={editingPrizes[row._id] !== undefined ? editingPrizes[row._id] : value}
                                onChange={(e) => handlePrizeEdit(row._id, e.target.value)}
                                className="w-24 h-8"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                            />
                            <span className="text-sm text-muted-foreground">PHP</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-700">
                                {formatCurrency(value)}
                            </span>
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'prizePercentage',
            label: 'Share',
            sortable: true,
            filterable: false,
            render: (value) => (
                <span className="text-sm text-muted-foreground">{value}%</span>
            )
        }
    ]

    const totalDistributed = prizeDistribution.reduce((sum, result) => sum + result.prizeAmount, 0)
    const remainingPrize = prizePool - totalDistributed

    return (
        <div className="space-y-6">
            {/* Fastest Kill Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-600" />
                        Fastest Kill Winners
                    </CardTitle>
                    <CardDescription>
                        Track the fastest kill times and prize distribution
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{fastestKillResultsCount}</div>
                            <div className="text-sm text-yellow-600">Total Winners</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(prizePool)}</div>
                            <div className="text-sm text-green-600">Total Prize Pool</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalDistributed)}</div>
                            <div className="text-sm text-blue-600">Distributed</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{formatCurrency(remainingPrize)}</div>
                            <div className="text-sm text-purple-600">Remaining</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Prize Distribution Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            Prize Distribution
                        </div>
                        <div className="flex gap-2">
                            {!isEditing ? (
                                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Prizes
                                </Button>
                            ) : (
                                <>
                                    <Button onClick={handleSavePrizes} size="sm" disabled={updatePrizeDistributionMutation.isPending}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {updatePrizeDistributionMutation.isPending ? 'Saving...' : 'Save'}
                                    </Button>
                                    <Button onClick={handleCancelEdit} variant="outline" size="sm">
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardTitle>
                    <CardDescription>
                        {isEditing
                            ? "Edit prize amounts for each winner. Total cannot exceed the prize pool."
                            : "Set up prize distribution for fastest kill winners"
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {remainingPrize < 0 && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">
                                ⚠️ Total prize distribution exceeds prize pool by {formatCurrency(Math.abs(remainingPrize))}
                            </p>
                        </div>
                    )}
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
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Prize:</span>
                                            <span className="font-bold text-lg text-green-700">
                                                {formatCurrency(winner.prizeAmount)}
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
