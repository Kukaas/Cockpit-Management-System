import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, Users } from 'lucide-react'
import { useGetAll } from '@/hooks/useApiQueries'
import DataTable from '@/components/custom/DataTable'
import { Badge } from '@/components/ui/badge'

const EntryFeesReportTab = ({ event, formatCurrency, formatDate }) => {
  const eventId = event?._id

  // Fetch participants for this event
  const { data: participantsData = [], isLoading } = useGetAll(
    eventId ? `/participants?eventID=${eventId}` : null
  )

  const participants = participantsData || []

  // Filter participants with entry fees
  const participantsWithEntryFee = participants.filter(p => p.entryFee && p.entryFee > 0)

  // Calculate totals
  const totalParticipants = participantsWithEntryFee.length
  const totalEntryFee = participantsWithEntryFee.reduce((sum, participant) => sum + (participant.entryFee || 0), 0)
  const averageEntryFee = totalParticipants > 0 ? totalEntryFee / totalParticipants : 0

  // Create table columns
  const entryFeeColumns = [
    {
      key: 'participantName',
      label: 'Participant Name',
      sortable: true,
      filterable: false
    },
    {
      key: 'contactNumber',
      label: 'Contact Number',
      sortable: true,
      filterable: false
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      filterable: false
    },
    {
      key: 'entryFee',
      label: 'Entry Fee',
      sortable: true,
      filterable: false,
      render: (value) => (
        <span className="font-medium text-blue-600">
          {formatCurrency(value || 0)}
        </span>
      )
    },
    {
      key: 'registrationDate',
      label: 'Registration Date',
      sortable: true,
      filterable: false,
      render: (value) => value ? formatDate(value) : 'N/A'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['registered', 'confirmed', 'withdrawn', 'disqualified'],
      render: (value) => (
        <Badge
          variant={
            value === 'confirmed' ? 'default' :
              value === 'withdrawn' ? 'destructive' :
                value === 'disqualified' ? 'secondary' : 'outline'
          }
          className="text-xs capitalize"
        >
          {value}
        </Badge>
      )
    }
  ]

  // Print functionality
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Entry Fees Report - ${event?.eventName || 'Event'}</title>
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
            <div class="event-title">Entry Fees Report</div>
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
            <div class="event-details">Report Generated: ${new Date().toLocaleString('en-US')}</div>
          </div>

          <div class="summary">
            <div class="summary-row">
              <span class="summary-label">Total Participants with Entry Fee:</span>
              <span>${totalParticipants}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Total Entry Fee Collected:</span>
              <span>${formatCurrency(totalEntryFee)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Average Entry Fee:</span>
              <span>${formatCurrency(averageEntryFee)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Event Entry Fee:</span>
              <span>${event?.entryFee ? formatCurrency(event.entryFee) : 'N/A'}</span>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Participant Name</th>
                <th>Contact Number</th>
                <th>Address</th>
                <th class="text-right">Entry Fee</th>
                <th>Registration Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${participantsWithEntryFee.map((participant, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${participant.participantName || 'N/A'}</td>
                  <td>${participant.contactNumber || 'N/A'}</td>
                  <td>${participant.address || 'N/A'}</td>
                  <td class="text-right">${formatCurrency(participant.entryFee || 0)}</td>
                  <td>${participant.registrationDate ? formatDate(participant.registrationDate) : 'N/A'}</td>
                  <td>${participant.status ? participant.status.charAt(0).toUpperCase() + participant.status.slice(1) : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" style="text-align: right; font-weight: bold;">Total:</td>
                <td class="text-right" style="font-weight: bold;">${formatCurrency(totalEntryFee)}</td>
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
        <p>Please select an event to view entry fees report</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground mt-1">
              With entry fee
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Entry Fee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalEntryFee)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Collected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Entry Fees Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Entry Fees Report
              </CardTitle>
              <CardDescription>
                Entry fees collected from participants
              </CardDescription>
            </div>
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={participantsWithEntryFee}
            columns={entryFeeColumns}
            pageSize={10}
            searchable={true}
            filterable={true}
            title="Entry Fees"
            loading={isLoading}
            emptyMessage="No participants with entry fees found for this event"
            className="shadow-sm"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default EntryFeesReportTab

