import React, { useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, Users, Ticket } from 'lucide-react'
import RentalsReportTab from './RentalsReportTab'
import EntrancesReportTab from './EntrancesReportTab'
import PlazadaReportTab from './PlazadaReportTab'
import EntryFeesReportTab from './EntryFeesReportTab'

const ReportTabs = ({
    activeTab,
    setActiveTab,
    event = null,
    formatCurrency,
    formatDate
}) => {
    // Check if event has entry fee
    const hasEntryFee = event?.entryFee && event.entryFee > 0

    // If active tab is entry-fees but event doesn't have entry fee, switch to rentals
    useEffect(() => {
        if (activeTab === 'entry-fees' && !hasEntryFee) {
            setActiveTab('rentals')
        }
    }, [activeTab, hasEntryFee, setActiveTab])

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className={`grid w-full ${hasEntryFee ? 'grid-cols-4' : 'grid-cols-3'}`}>
                <TabsTrigger value="rentals" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Rentals
                </TabsTrigger>
                <TabsTrigger value="entrances" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Entrances
                </TabsTrigger>
                <TabsTrigger value="plazada" className="flex items-center gap-2">
                    Plazada
                </TabsTrigger>
                {hasEntryFee && (
                    <TabsTrigger value="entry-fees" className="flex items-center gap-2">
                        <Ticket className="h-4 w-4" />
                        Entry Fees
                    </TabsTrigger>
                )}
            </TabsList>

            <TabsContent value="rentals" className="space-y-4">
                <RentalsReportTab
                    event={event}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                />
            </TabsContent>

            <TabsContent value="entrances" className="space-y-4">
                <EntrancesReportTab
                    event={event}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                />
            </TabsContent>

            <TabsContent value="plazada" className="space-y-4">
                <PlazadaReportTab
                    event={event}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                />
            </TabsContent>

            {hasEntryFee && (
                <TabsContent value="entry-fees" className="space-y-4">
                    <EntryFeesReportTab
                        event={event}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                    />
                </TabsContent>
            )}
        </Tabs>
    )
}

export default ReportTabs

