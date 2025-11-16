import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import { useGetAll } from '@/hooks/useApiQueries'
import DataTable from '@/components/custom/DataTable'

// Import custom components
import CageAvailabilitySummary from '@/pages/tangkal-staff/cage-availability/components/CageAvailabilitySummary'
import { createViewOnlyCageColumns } from './components/ViewOnlyCageColumns'

const AdminCageAvailability = () => {
  const navigate = useNavigate()

  // Fetch cage availability records
  const { data: cagesData = [], isLoading } = useGetAll('/cage-availability')

  // Fetch summary data
  const { data: summaryData } = useGetAll('/cage-availability/summary')

  // Use the API data directly
  const cages = cagesData || []

  // Create table columns
  const cageColumns = createViewOnlyCageColumns()

  return (
    <PageLayout
      title="Cage Availability Overview"
      description="View cage availability records and track cage status across different arenas"
      headerButton={
        <Button variant="outline" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      }
    >
      {/* Cage Availability Summary */}
      <CageAvailabilitySummary summaryData={summaryData} />

      {/* Cage Availability Section */}
      <div className="space-y-4">
        <div className="flex justify-end items-center">
          <div className="text-sm text-muted-foreground">
            View-only mode - No editing capabilities
          </div>
        </div>
        <DataTable
          data={cages}
          columns={cageColumns}
          pageSize={10}
          searchable={true}
          filterable={true}
          title="Cage Availability"
          loading={isLoading}
          emptyMessage="No cage availability records found"
          className="shadow-sm"
        />
      </div>
    </PageLayout>
  )
}

export default AdminCageAvailability
