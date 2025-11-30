import React, { useState, useEffect } from 'react'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

const ReturnCagesDialog = ({
    open,
    onOpenChange,
    rental,
    onConfirm,
    isPending
}) => {
    const [selectedCageIds, setSelectedCageIds] = useState([])

    // Reset selection when dialog opens
    useEffect(() => {
        if (open && rental) {
            // Pre-select all non-returned cages
            const activeCages = rental.cages
                .filter(cage => !cage.returnedAt)
                .map(cage => cage.cageNo._id || cage.cageNo)
            setSelectedCageIds(activeCages)
        }
    }, [open, rental])

    if (!rental) return null

    const handleToggleCage = (cageId) => {
        setSelectedCageIds(prev =>
            prev.includes(cageId)
                ? prev.filter(id => id !== cageId)
                : [...prev, cageId]
        )
    }

    const handleSelectAll = () => {
        const activeCages = rental.cages
            .filter(cage => !cage.returnedAt)
            .map(cage => cage.cageNo._id || cage.cageNo)
        setSelectedCageIds(activeCages)
    }

    const handleDeselectAll = () => {
        setSelectedCageIds([])
    }

    const handleSubmit = () => {
        if (selectedCageIds.length > 0) {
            onConfirm(selectedCageIds)
        }
    }

    const activeCagesCount = rental.cages.filter(cage => !cage.returnedAt).length
    const returnedCagesCount = rental.cages.filter(cage => cage.returnedAt).length

    return (
        <CustomAlertDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Return Cages"
            description={`Select which cages to return for ${rental.nameOfRenter}. ${activeCagesCount} active, ${returnedCagesCount} already returned.`}
            maxHeight="max-h-[70vh]"
            actions={
                <>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || selectedCageIds.length === 0}
                    >
                        {isPending ? 'Returning...' : `Return ${selectedCageIds.length} Cage${selectedCageIds.length !== 1 ? 's' : ''}`}
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                {/* Selection controls */}
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        disabled={activeCagesCount === 0}
                    >
                        Select All Active
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDeselectAll}
                    >
                        Deselect All
                    </Button>
                </div>

                {/* Cage list */}
                <div className="border rounded-md max-h-[400px] overflow-y-auto">
                    <div className="divide-y">
                        {rental.cages.map((cage, index) => {
                            const cageId = cage.cageNo._id || cage.cageNo
                            const cageNumber = cage.cageNo.cageNumber || cage.cageNo.availabilityNumber || `Cage ${index + 1}`
                            const isReturned = cage.returnedAt !== null
                            const isSelected = selectedCageIds.includes(cageId)

                            return (
                                <div
                                    key={cageId}
                                    className={`flex items-center justify-between p-3 ${isReturned ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id={`cage-${cageId}`}
                                            checked={isSelected}
                                            onCheckedChange={() => handleToggleCage(cageId)}
                                            disabled={isReturned || isPending}
                                        />
                                        <Label
                                            htmlFor={`cage-${cageId}`}
                                            className={`text-sm font-medium ${isReturned ? 'text-gray-500' : 'cursor-pointer'
                                                }`}
                                        >
                                            Cage {cageNumber}
                                        </Label>
                                    </div>
                                    <div>
                                        {isReturned ? (
                                            <Badge variant="secondary" className="text-xs">
                                                Returned {formatDate(cage.returnedAt)}
                                            </Badge>
                                        ) : (
                                            <Badge variant="default" className="text-xs">
                                                Active
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Summary */}
                <div className="text-sm text-muted-foreground">
                    {selectedCageIds.length} of {activeCagesCount} active cage{activeCagesCount !== 1 ? 's' : ''} selected
                </div>
            </div>
        </CustomAlertDialog>
    )
}

export default ReturnCagesDialog
