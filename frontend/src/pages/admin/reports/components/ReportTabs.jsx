import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, Users, DollarSign } from 'lucide-react'
import RentalsReportTab from './RentalsReportTab'
import EntrancesReportTab from './EntrancesReportTab'
import PlazadaReportTab from './PlazadaReportTab'

const ReportTabs = ({
    activeTab,
    setActiveTab,
    event = null,
    formatCurrency,
    formatDate
}) => {
    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="rentals" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Rentals
                </TabsTrigger>
                <TabsTrigger value="entrances" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Entrances
                </TabsTrigger>
                <TabsTrigger value="plazada" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Plazada
                </TabsTrigger>
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
        </Tabs>
    )
}

export default ReportTabs

