import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CustomAlertDialog from '@/components/custom/CustomAlertDialog'
import InputField from '@/components/custom/InputField'
import NativeSelect from '@/components/custom/NativeSelect'

const FilterDialog = ({
  open,
  onOpenChange,
  filters,
  onFilterChange,
  onClearFilters,
  events
}) => {
  return (
    <CustomAlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Filter Entrance Records"
      description="Apply filters to narrow down entrance records"
      maxHeight="max-h-[90vh]"
      actions={
        <>
          <Button variant="outline" onClick={onClearFilters}>
            Clear All
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Apply Filters
          </Button>
        </>
      }
    >
      <div className="space-y-6 overflow-y-auto pr-2">
        {/* Event Filter */}
        <div className="space-y-2">
          <Label htmlFor="eventFilter" className="text-sm font-medium">
            Event
          </Label>
          <NativeSelect
            id="eventFilter"
            value={filters.eventID}
            onChange={(e) => onFilterChange('eventID', e.target.value)}
          >
            <option value="">All Events</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.eventName} - {new Date(event.date).toLocaleDateString()}
              </option>
            ))}
          </NativeSelect>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="statusFilter" className="text-sm font-medium">
            Status
          </Label>
          <NativeSelect
            id="statusFilter"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </NativeSelect>
        </div>

        {/* Date Range Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateFrom" className="text-sm font-medium">
              Date From
            </Label>
            <InputField
              id="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onFilterChange('dateFrom', e.target.value)}
              placeholder="Select start date"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateTo" className="text-sm font-medium">
              Date To
            </Label>
            <InputField
              id="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={(e) => onFilterChange('dateTo', e.target.value)}
              placeholder="Select end date"
            />
          </div>
        </div>

        {/* Search Filter */}
        <div className="space-y-2">
          <Label htmlFor="searchFilter" className="text-sm font-medium">
            Search
          </Label>
          <InputField
            id="searchFilter"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search by name, email, contact number, or address"
          />
          <p className="text-xs text-muted-foreground">
            Search across person name, email, contact number, and address fields
          </p>
        </div>

        {/* Active Filters Summary */}
        {Object.values(filters).some(value => value !== '') && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Active Filters:</h4>
            <div className="flex flex-wrap gap-2">
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
                  From: {filters.dateFrom}
                </span>
              )}
              {filters.dateTo && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                  To: {filters.dateTo}
                </span>
              )}
              {filters.search && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                  Search: "{filters.search}"
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </CustomAlertDialog>
  )
}

export default FilterDialog
