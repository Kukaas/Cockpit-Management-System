import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Filter } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { useGetAll } from '@/hooks/useApiQueries'
import DataTable from '@/components/custom/DataTable'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import { createAdminEntranceColumns } from './components/TableColumns'
import EntranceStats from './components/EntranceStats'
import FilterDialog from './components/FilterDialog'

const Entrance = () => {
  // State for filters
  const [filters, setFilters] = useState({
    eventID: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  })

  // State for filter dialog
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)

  // State for detail dialog
  const [selectedEntrance, setSelectedEntrance] = useState(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Build query string from filters
  const buildQueryString = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    return params.toString()
  }

  // Fetch entrances with filters
  const queryString = buildQueryString()
  const { data: entrancesData = [], isLoading } = useGetAll(`/entrances?${queryString}`)

  // Fetch events for filter dropdown
  const { data: events = [] } = useGetAll('/events')

  // Format functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      eventID: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    })
  }

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  // Handle view details
  const handleViewDetails = (entrance) => {
    setSelectedEntrance(entrance)
    setDetailDialogOpen(true)
  }

  const handleCloseDetails = () => {
    setDetailDialogOpen(false)
    setSelectedEntrance(null)
  }

  // Create table columns
  const entranceColumns = createAdminEntranceColumns(formatCurrency, formatDate, handleViewDetails)

  // Calculate summary statistics
  const totalEntrances = entrancesData.length
  const totalRevenue = entrancesData.reduce((sum, entrance) => sum + (entrance.entranceFee || 0), 0)
  const averageFee = totalEntrances > 0 ? totalRevenue / totalEntrances : 0

  return (
    <PageLayout
      title="Entrance Records"
      description="Monitor and view all entrance records across events"
      headerButton={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setFilterDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                {Object.values(filters).filter(v => v !== '').length}
              </span>
            )}
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      }
    >
      {/* Statistics Cards */}
      <EntranceStats
        totalEntrances={totalEntrances}
        totalRevenue={totalRevenue}
        averageFee={averageFee}
        formatCurrency={formatCurrency}
      />

      {/* Filters Summary */}
      {hasActiveFilters && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Active filters:</span>
              {filters.eventID && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  Event: {events.find(e => e._id === filters.eventID)?.eventName || filters.eventID}
                </span>
              )}
              {filters.status && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs capitalize">
                  Status: {filters.status}
                </span>
              )}
              {filters.dateFrom && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                  From: {formatDate(filters.dateFrom)}
                </span>
              )}
              {filters.dateTo && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                  To: {formatDate(filters.dateTo)}
                </span>
              )}
              {filters.search && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                  Search: "{filters.search}"
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={entrancesData}
        columns={entranceColumns}
        pageSize={15}
        searchable={true}
        filterable={true}
        title="Entrance Records"
        loading={isLoading}
        emptyMessage="No entrance records found"
        className="shadow-sm"
      />

      {/* Filter Dialog */}
      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        events={events}
      />

      {/* Detail View Dialog */}
      <CustomAlertDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        title="Entrance Record Details"
        description="Detailed information for this entrance record"
        maxHeight="max-h-[85vh]"
        actions={
          <Button onClick={handleCloseDetails} className="w-full sm:w-auto">
            Close
          </Button>
        }
      >
        {selectedEntrance && (
          <div className="space-y-6 overflow-y-auto pr-2">
                         <div className="bg-gray-50 p-4 rounded-lg">
               <h4 className="font-semibold text-lg mb-3 text-gray-900">Person Information</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <p className="text-sm font-medium text-gray-600 mb-1">Full Name</p>
                   <p className="font-medium text-gray-900 break-words">{selectedEntrance.personName}</p>
                 </div>
                 <div>
                   <p className="text-sm font-medium text-gray-600 mb-1">Contact Number</p>
                   <p className="font-medium text-gray-900 break-words">{selectedEntrance.contactNumber}</p>
                 </div>
                 <div className="md:col-span-2">
                   <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                   <p className="font-medium text-gray-900 break-all">{selectedEntrance.email}</p>
                 </div>
                 <div>
                   <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                   <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                     selectedEntrance.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                   }`}>
                     {selectedEntrance.status.charAt(0).toUpperCase() + selectedEntrance.status.slice(1)}
                   </span>
                 </div>
               </div>
               <div className="mt-4">
                 <p className="text-sm font-medium text-gray-600 mb-1">Address</p>
                 <p className="text-gray-900 break-words">{selectedEntrance.address}</p>
               </div>
             </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-lg mb-3 text-gray-900">Event Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Event Name</p>
                  <p className="font-medium text-gray-900">{selectedEntrance.eventID?.eventName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Location</p>
                  <p className="font-medium text-gray-900">{selectedEntrance.eventID?.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Event Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedEntrance.eventID?.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Entrance Fee</p>
                  <p className="font-medium text-green-600">{formatCurrency(selectedEntrance.entranceFee)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-lg mb-3 text-gray-900">Record Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Recorded Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedEntrance.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Recorded By</p>
                  <p className="font-medium text-gray-900">
                    {selectedEntrance.recordedBy?.firstName} {selectedEntrance.recordedBy?.lastName}
                  </p>
                </div>
              </div>
            </div>

            {selectedEntrance.notes && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-3 text-gray-900">Notes</h4>
                <p className="text-gray-900">{selectedEntrance.notes}</p>
              </div>
            )}
          </div>
        )}
      </CustomAlertDialog>
    </PageLayout>
  )
}

export default Entrance
