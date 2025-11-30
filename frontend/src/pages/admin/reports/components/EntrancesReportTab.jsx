import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, Users, Calendar } from 'lucide-react'
import { useGetAll } from '@/hooks/useApiQueries'
import DataTable from '@/components/custom/DataTable'
import { createAdminEntranceColumns } from '../../entrance/components/TableColumns'

const EntrancesReportTab = ({ event, formatCurrency, formatDate }) => {
  const eventId = event?._id

  // Fetch entrances for this event
  const { data: entrancesData = [], isLoading } = useGetAll(
    eventId ? `/entrances?eventID=${eventId}` : null
  )

  const entrances = entrancesData || []

  // Calculate totals
  const totalEntrances = entrances.reduce((sum, entrance) => sum + (entrance.count || 0), 0)
  const totalRevenue = totalEntrances * (event?.entranceFee || 0)
  const totalRecords = entrances.length

  // Create table columns
  const entranceColumns = createAdminEntranceColumns(formatDate, formatCurrency)

  // Print functionality
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Entrances Report - ${event?.eventName || 'Event'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .event-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .event-details {
              font-size: 14px;
              color: #666;
              margin-bottom: 5px;
            }
            .summary {
              margin: 20px 0;
              padding: 15px;
              background-color: #f5f5f5;
              border-radius: 5px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .summary-label {
              font-weight: bold;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .table th,
            .table td {
              border: 1px solid #333;
              padding: 8px;
              text-align: left;
            }
            .table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .text-right {
              text-align: right;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="event-title">Entrances Report</div>
            <div class="event-title">${event?.eventName || 'Event Name'}</div>
            <div class="event-details">Date: ${event?.date ? new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'N/A'}</div>
            <div class="event-details">Time: ${event?.date ? new Date(event.date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) : 'N/A'}</div>
            <div class="event-details">Location: ${event?.location || 'N/A'}</div>
            <div class="event-details">Entrance Fee: ${event?.entranceFee ? formatCurrency(event.entranceFee) : 'N/A'}</div>
            <div class="event-details">Report Generated: ${new Date().toLocaleString('en-US')}</div>
          </div>

          <div class="summary">
            <div class="summary-row">
              <span class="summary-label">Total Entrances:</span>
              <span>${totalEntrances}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Total Revenue:</span>
              <span>${formatCurrency(totalRevenue)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Total Records:</span>
              <span>${totalRecords}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Entrance Fee per Person:</span>
              <span>${event?.entranceFee ? formatCurrency(event.entranceFee) : 'N/A'}</span>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Number of Entrances</th>
                <th>Total Amount</th>
                <th>Date Recorded</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              ${entrances.map((entrance, index) => {
      const entranceTotal = (entrance.count || 0) * (event?.entranceFee || 0)
      return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${entrance.count || 0}</td>
                  <td class="text-right">${formatCurrency(entranceTotal)}</td>
                  <td>${entrance.date ? new Date(entrance.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'N/A'}</td>
                  <td>${entrance.recordedBy?.username || entrance.recordedBy?.firstName || 'N/A'}</td>
                </tr>
              `
    }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="text-align: right; font-weight: bold;">Total:</td>
                <td class="text-right" style="font-weight: bold;">${formatCurrency(totalRevenue)}</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  if (!eventId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Please select an event to view entrances report</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Entrances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntrances}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
          </CardContent>
        </Card>
      </div>

      {/* Entrances Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-end">
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={entrances}
            columns={entranceColumns}
            pageSize={10}
            searchable={true}
            filterable={true}
            title="Entrance Report"
            loading={isLoading}
            emptyMessage="No entrance records found for this event"
            className="shadow-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default EntrancesReportTab

